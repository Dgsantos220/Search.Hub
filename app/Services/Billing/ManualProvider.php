<?php

namespace App\Services\Billing;

use App\Contracts\BillingProvider;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Support\Str;

class ManualProvider implements BillingProvider
{
    protected SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function getName(): string
    {
        return 'manual';
    }

    public function createCheckout(User $user, Plan $plan, array $options = []): array
    {
        if ($plan->price_cents > 0) {
             return [
                'success' => false,
                'error' => 'MANUAL_PAYMENT_REQUIRED',
                'message' => 'O pagamento online nao esta disponivel no momento. Para assinar este plano, entre em contato com o suporte.'
             ];
        }

        // Se for gratuito, criar como ACTIVE
        $subscription = $this->subscriptionService->subscribe($user, $plan, 'manual', null, Subscription::STATUS_ACTIVE);

        return [
            'success' => true,
            'subscription_id' => $subscription->id,
            'status' => 'active',
            'message' => 'Assinatura ativada com sucesso!',
        ];
    }

    public function handleWebhook(array $payload): array
    {
        $action = $payload['action'] ?? null;
        $paymentId = $payload['payment_id'] ?? null;

        if (!$action || !$paymentId) {
            return ['success' => false, 'error' => 'Invalid payload'];
        }

        $payment = Payment::find($paymentId);
        if (!$payment) {
            return ['success' => false, 'error' => 'Payment not found'];
        }

        switch ($action) {
            case 'approve':
                $payment->markAsPaid();
                if ($payment->subscription) {
                    $payment->subscription->update(['status' => Subscription::STATUS_ACTIVE]);
                }
                return ['success' => true, 'message' => 'Payment approved'];

            case 'reject':
                $payment->markAsFailed($payload['reason'] ?? 'Rejected by admin');
                return ['success' => true, 'message' => 'Payment rejected'];

            default:
                return ['success' => false, 'error' => 'Unknown action'];
        }
    }

    public function cancelSubscription(Subscription $subscription): bool
    {
        $this->subscriptionService->cancel($subscription, false);
        return true;
    }

    public function changePlan(Subscription $subscription, Plan $newPlan): bool
    {
        $this->subscriptionService->changePlan($subscription, $newPlan, true);
        return true;
    }

    public function getSubscriptionStatus(Subscription $subscription): ?string
    {
        return $subscription->status;
    }

    public function refund(string $paymentReference, int $amountCents = null): bool
    {
        $payment = Payment::where('provider_reference', $paymentReference)->first();
        
        if (!$payment) {
            return false;
        }

        $payment->update(['status' => Payment::STATUS_REFUNDED]);
        return true;
    }

    public function approvePayment(int $paymentId): bool
    {
        $payment = Payment::find($paymentId);
        
        if (!$payment || !$payment->isPending()) {
            return false;
        }

        $this->subscriptionService->confirmPayment($payment);

        return true;
    }
}
