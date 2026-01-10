<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use App\Services\UsageService;
use App\Services\Billing\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSubscriptionController extends Controller
{
    protected SubscriptionService $subscriptionService;
    protected UsageService $usageService;
    protected BillingService $billingService;

    public function __construct(
        SubscriptionService $subscriptionService,
        UsageService $usageService,
        BillingService $billingService
    ) {
        $this->subscriptionService = $subscriptionService;
        $this->usageService = $usageService;
        $this->billingService = $billingService;
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_subscription' => false,
                    'subscription' => null,
                    'usage' => null,
                ],
            ]);
        }

        $usage = $this->usageService->getUsageStats($user);

        return response()->json([
            'success' => true,
            'data' => [
                'has_subscription' => true,
                'subscription' => $this->formatSubscription($subscription),
                'usage' => $usage['usage'] ?? null,
            ],
        ]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'provider' => 'sometimes|string|in:manual,stripe,mercadopago',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        if (!$plan->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Este plano não está disponível.',
            ], 422);
        }

        $provider = $validated['provider'] ?? null;
        $result = $this->billingService->createCheckout($request->user(), $plan, $provider);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'] ?? $result['error'] ?? null,
            'data' => [
                'subscription_id' => $result['subscription_id'] ?? null,
                'payment_id' => $result['payment_id'] ?? null,
                'checkout_url' => $result['checkout_url'] ?? null,
                'status' => $result['status'] ?? null,
            ],
        ], $result['success'] ? 200 : 422);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Você não possui uma assinatura ativa.',
            ], 404);
        }

        $atPeriodEnd = $request->input('at_period_end', true);
        
        $this->subscriptionService->cancel($subscription, $atPeriodEnd);

        $message = $atPeriodEnd 
            ? 'Assinatura será cancelada ao fim do período atual.'
            : 'Assinatura cancelada imediatamente.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $this->formatSubscription($subscription->fresh()),
        ]);
    }

    public function changePlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'immediate' => 'boolean',
        ]);

        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Você não possui uma assinatura ativa. Por favor, assine um plano primeiro.',
            ], 404);
        }

        $newPlan = Plan::findOrFail($validated['plan_id']);

        if (!$newPlan->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Este plano não está disponível.',
            ], 422);
        }

        if ($subscription->plan_id === $newPlan->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você já está neste plano.',
            ], 422);
        }

        $immediate = $validated['immediate'] ?? true;
        $subscription = $this->subscriptionService->changePlan($subscription, $newPlan, $immediate);

        return response()->json([
            'success' => true,
            'message' => 'Plano alterado com sucesso.',
            'data' => $this->formatSubscription($subscription),
        ]);
    }

    public function reactivate(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscriptions()
            ->whereIn('status', ['canceled', 'expired'])
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhuma assinatura encontrada para reativar.',
            ], 404);
        }

        $subscription = $this->subscriptionService->reactivate($subscription);

        return response()->json([
            'success' => true,
            'message' => 'Assinatura reativada com sucesso.',
            'data' => $this->formatSubscription($subscription),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);

        $subscriptions = $user->subscriptions()
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $subscriptions->items(),
            'pagination' => [
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
            ],
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);

        $payments = $user->payments()
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

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

    protected function formatSubscription(Subscription $subscription): array
    {
        $plan = $subscription->plan;

        return [
            'id' => $subscription->id,
            'status' => $subscription->status,
            'status_label' => match($subscription->status) {
                'trialing' => 'Em teste',
                'active' => 'Ativo',
                'past_due' => 'Pagamento pendente',
                'canceled' => 'Cancelado',
                'expired' => 'Expirado',
                default => $subscription->status,
            },
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'price' => $plan->price,
                'formatted_price' => $plan->formatted_price,
                'interval' => $plan->interval,
            ],
            'started_at' => $subscription->started_at?->toIso8601String(),
            'current_period_start' => $subscription->current_period_start?->toIso8601String(),
            'current_period_end' => $subscription->current_period_end?->toIso8601String(),
            'days_remaining' => $subscription->days_remaining,
            'canceled_at' => $subscription->canceled_at?->toIso8601String(),
            'cancel_at_period_end' => $subscription->cancel_at_period_end,
            'provider' => $subscription->provider,
        ];
    }
}
