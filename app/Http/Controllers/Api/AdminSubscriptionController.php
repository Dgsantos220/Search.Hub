<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use App\Services\Billing\ManualProvider;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSubscriptionController extends Controller
{
    protected SubscriptionService $subscriptionService;
    protected ManualProvider $billingProvider;

    public function __construct(SubscriptionService $subscriptionService, ManualProvider $billingProvider)
    {
        $this->subscriptionService = $subscriptionService;
        $this->billingProvider = $billingProvider;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Subscription::with(['user', 'plan']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $subscriptions->map(fn($s) => $this->formatSubscription($s)),
            'pagination' => [
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
            ],
        ]);
    }

    public function show(Subscription $subscription): JsonResponse
    {
        $subscription->load(['user', 'plan', 'payments']);

        return response()->json([
            'success' => true,
            'data' => $this->formatSubscription($subscription, true),
        ]);
    }

    public function update(Request $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => 'sometimes|exists:plans,id',
            'status' => 'sometimes|in:trialing,active,past_due,canceled,expired',
            'current_period_end' => 'sometimes|date',
            'cancel_at_period_end' => 'sometimes|boolean',
        ]);

        if (isset($validated['plan_id']) && $validated['plan_id'] != $subscription->plan_id) {
            $newPlan = Plan::find($validated['plan_id']);
            $this->subscriptionService->changePlan($subscription, $newPlan, true);
            unset($validated['plan_id']);
        }

        if (!empty($validated)) {
            if (isset($validated['current_period_end'])) {
                $validated['current_period_end'] = Carbon::parse($validated['current_period_end']);
            }
            $subscription->update($validated);
        }

        return response()->json([
            'success' => true,
            'message' => 'Assinatura atualizada com sucesso.',
            'data' => $this->formatSubscription($subscription->fresh(['user', 'plan'])),
        ]);
    }

    public function cancel(Subscription $subscription): JsonResponse
    {
        $this->subscriptionService->cancel($subscription, false);

        return response()->json([
            'success' => true,
            'message' => 'Assinatura cancelada.',
            'data' => $this->formatSubscription($subscription->fresh(['user', 'plan'])),
        ]);
    }

    public function reactivate(Subscription $subscription): JsonResponse
    {
        $subscription = $this->subscriptionService->reactivate($subscription);

        return response()->json([
            'success' => true,
            'message' => 'Assinatura reativada.',
            'data' => $this->formatSubscription($subscription->load(['user', 'plan'])),
        ]);
    }

    public function createForUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = User::find($validated['user_id']);
        $plan = Plan::find($validated['plan_id']);

        $subscription = $this->subscriptionService->subscribe($user, $plan, 'manual');

        return response()->json([
            'success' => true,
            'message' => 'Assinatura criada para o usuário.',
            'data' => $this->formatSubscription($subscription->load(['user', 'plan'])),
        ], 201);
    }

    public function stats(): JsonResponse
    {
        $activeSubscriptions = Subscription::whereIn('status', ['active', 'trialing'])->count();
        $trialingSubscriptions = Subscription::where('status', 'trialing')->count();
        $canceledThisMonth = Subscription::where('status', 'canceled')
            ->whereMonth('canceled_at', now()->month)
            ->count();
        
        $subscriptionsByPlan = Subscription::whereIn('status', ['active', 'trialing'])
            ->selectRaw('plan_id, count(*) as count')
            ->groupBy('plan_id')
            ->with('plan:id,name')
            ->get()
            ->map(fn($item) => [
                'plan_id' => $item->plan_id,
                'plan_name' => $item->plan?->name ?? 'N/A',
                'count' => $item->count,
            ]);

        $revenueThisMonth = Payment::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->sum('amount_cents');

        $subscriptionsByStatus = Subscription::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $churnRate = $this->calculateChurnRate();

        return response()->json([
            'success' => true,
            'data' => [
                'active_subscriptions' => $activeSubscriptions,
                'trialing_subscriptions' => $trialingSubscriptions,
                'canceled_this_month' => $canceledThisMonth,
                'revenue_this_month' => $revenueThisMonth,
                'revenue_this_month_formatted' => 'R$ ' . number_format($revenueThisMonth / 100, 2, ',', '.'),
                'by_plan' => $subscriptionsByPlan,
                'by_status' => $subscriptionsByStatus,
                'churn_rate' => $churnRate,
            ],
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $query = Payment::with(['user', 'plan', 'subscription']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function approvePayment(Payment $payment): JsonResponse
    {
        if (!$payment->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Este pagamento não está pendente.',
            ], 422);
        }

        $this->billingProvider->approvePayment($payment->id);

        return response()->json([
            'success' => true,
            'message' => 'Pagamento aprovado com sucesso.',
        ]);
    }

    public function rejectPayment(Request $request, Payment $payment): JsonResponse
    {
        if (!$payment->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Este pagamento não está pendente.',
            ], 422);
        }

        $reason = $request->input('reason', 'Rejeitado pelo administrador');
        $payment->markAsFailed($reason);

        return response()->json([
            'success' => true,
            'message' => 'Pagamento rejeitado.',
        ]);
    }

    protected function calculateChurnRate(): float
    {
        $startOfMonth = now()->startOfMonth();
        $activeAtStart = Subscription::where('created_at', '<', $startOfMonth)
            ->whereIn('status', ['active', 'trialing'])
            ->count();

        if ($activeAtStart === 0) {
            return 0;
        }

        $canceledThisMonth = Subscription::where('status', 'canceled')
            ->whereMonth('canceled_at', now()->month)
            ->count();

        return round(($canceledThisMonth / $activeAtStart) * 100, 2);
    }

    protected function formatSubscription(Subscription $subscription, bool $detailed = false): array
    {
        $data = [
            'id' => $subscription->id,
            'user' => $subscription->user ? [
                'id' => $subscription->user->id,
                'name' => $subscription->user->name,
                'email' => $subscription->user->email,
            ] : null,
            'plan' => $subscription->plan ? [
                'id' => $subscription->plan->id,
                'name' => $subscription->plan->name,
                'slug' => $subscription->plan->slug,
                'price' => $subscription->plan->price,
                'formatted_price' => $subscription->plan->formatted_price,
            ] : null,
            'status' => $subscription->status,
            'status_label' => match($subscription->status) {
                'trialing' => 'Em teste',
                'active' => 'Ativo',
                'past_due' => 'Pagamento pendente',
                'canceled' => 'Cancelado',
                'expired' => 'Expirado',
                default => $subscription->status,
            },
            'started_at' => $subscription->started_at?->toIso8601String(),
            'current_period_end' => $subscription->current_period_end?->toIso8601String(),
            'days_remaining' => $subscription->days_remaining,
            'cancel_at_period_end' => $subscription->cancel_at_period_end,
            'provider' => $subscription->provider,
            'created_at' => $subscription->created_at->toIso8601String(),
        ];

        if ($detailed && $subscription->relationLoaded('payments')) {
            $data['payments'] = $subscription->payments->map(fn($p) => [
                'id' => $p->id,
                'amount' => $p->amount,
                'formatted_amount' => $p->formatted_amount,
                'status' => $p->status,
                'paid_at' => $p->paid_at?->toIso8601String(),
                'created_at' => $p->created_at->toIso8601String(),
            ]);
        }

        return $data;
    }
}
