<?php

namespace App\Http\Controllers;

use App\Models\ConsultaHistory;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function history(Request $request): Response
    {
        $perPage = 20;
        
        $items = ConsultaHistory::byUser(Auth::id())
            ->recent()
            ->limit($perPage + 1)
            ->get();
        
        $hasMore = $items->count() > $perPage;
        if ($hasMore) {
            $items = $items->take($perPage);
        }

        $nextCursor = $hasMore && $items->isNotEmpty() 
            ? ConsultaHistory::encodeCursor($items->last()->created_at->format('Y-m-d H:i:s'), $items->last()->id)
            : null;

        $data = $items->map(fn($item) => [
            'id' => $item->id,
            'tipo' => $item->tipo,
            'query' => $item->query,
            'success' => $item->success,
            'resultado_resumo' => $item->resultado_resumo,
            'created_at' => $item->created_at->format('d/m/Y H:i'),
            'created_at_relative' => $item->created_at->diffForHumans(),
        ]);

        return Inertia::render('History', [
            'history' => [
                'data' => $data,
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ],
        ]);
    }

    public function storeHistory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tipo' => 'required|string',
            'query' => 'required|string',
            'success' => 'boolean',
            'resultado_resumo' => 'nullable|array',
        ]);

        ConsultaHistory::create([
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return back()->with('success', 'Consulta registrada.');
    }

    public function deleteHistory(int $id): RedirectResponse
    {
        $history = ConsultaHistory::where('user_id', Auth::id())
            ->findOrFail($id);
        
        $history->delete();

        return back()->with('success', 'Registro removido.');
    }

    public function clearHistory(): RedirectResponse
    {
        ConsultaHistory::where('user_id', Auth::id())->forceDelete();

        return back()->with('success', 'Histórico limpo com sucesso.');
    }

    public function profile(): Response
    {
        $user = Auth::user();

        return Inertia::render('Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'created_at' => $user->created_at->format('d/m/Y'),
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'current_password' => 'required_with:password|current_password',
            'password' => 'sometimes|min:8|confirmed',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }
        if (isset($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Perfil atualizado com sucesso.');
    }

    public function plans(): Response
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price_cents')
            ->get()
            ->map(fn($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'interval' => $plan->interval,
                'features' => $plan->features ?? [],
            ]);

        $currentSubscription = null;
        if (Auth::check()) {
            $sub = Subscription::where('user_id', Auth::id())
                ->whereIn('status', ['active', 'trialing'])
                ->with('plan:id,name')
                ->first();

            if ($sub) {
                $currentSubscription = [
                    'id' => $sub->id,
                    'plan_id' => $sub->plan_id,
                    'plan_name' => $sub->plan?->name,
                    'status' => $sub->status,
                ];
            }
        }

        return Inertia::render('Plans', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
        ]);
    }

    public function subscription(): Response
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->with('plan')
            ->first();

        $payments = Payment::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'created_at' => $payment->created_at->format('d/m/Y H:i'),
            ]);

        $plans = Plan::where('is_active', true)
            ->orderBy('price_cents')
            ->get()
            ->map(fn($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'interval' => $plan->interval,
            ]);

        return Inertia::render('Subscription', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price,
                    'interval' => $subscription->plan->interval,
                    'features' => $subscription->plan->features ?? [],
                ] : null,
                'status' => $subscription->status,
                'current_period_start' => $subscription->current_period_start?->format('d/m/Y'),
                'current_period_end' => $subscription->current_period_end?->format('d/m/Y'),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
            ] : null,
            'payments' => $payments,
            'plans' => $plans,
        ]);
    }

    public function cancelSubscription(): RedirectResponse
    {
        $subscription = Subscription::where('user_id', Auth::id())
            ->whereIn('status', ['active', 'trialing'])
            ->first();

        if (!$subscription) {
            return back()->with('error', 'Nenhuma assinatura ativa encontrada.');
        }

        $subscription->update([
            'cancel_at_period_end' => true,
        ]);

        return back()->with('success', 'Sua assinatura será cancelada ao final do período.');
    }

    public function checkout(Request $request, \App\Services\Billing\BillingService $billingService): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'gateway' => 'nullable|string|in:stripe,mercadopago,manual'
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $user = Auth::user();
        
        try {
            $gateway = $validated['gateway'] ?? $billingService->getDefaultProvider();
            $checkoutData = $billingService->createCheckout($user, $plan, $gateway);

            if (isset($checkoutData['url'])) {
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => true,
                        'url' => $checkoutData['url']
                    ]);
                }
                return redirect()->away($checkoutData['url']);
            }

            if (isset($checkoutData['success']) && !$checkoutData['success']) {
                return back()->with('error', $checkoutData['message'] ?? 'Não foi possível iniciar o checkout.');
            }

            return back()->with('success', $checkoutData['message'] ?? 'Checkout iniciado! Verifique as instruções de pagamento.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Checkout error: ' . $e->getMessage());
            return back()->with('error', 'Erro ao processar checkout: ' . $e->getMessage());
        }
    }
}
