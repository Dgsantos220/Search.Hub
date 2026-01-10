<?php

namespace App\Services\Billing;

use App\Contracts\BillingProvider;
use App\Models\GatewaySetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Customer;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;

class StripeProvider implements BillingProvider
{
    protected SubscriptionService $subscriptionService;
    protected ?GatewaySetting $settings = null;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
        $this->loadSettings();
    }

    protected function loadSettings(): void
    {
        $this->settings = GatewaySetting::getByProvider('stripe');
        
        if ($this->settings && $this->settings->secret_key) {
            Stripe::setApiKey($this->settings->secret_key);
        }
    }

    public function getName(): string
    {
        return 'stripe';
    }

    public function isConfigured(): bool
    {
        return $this->settings 
            && $this->settings->enabled 
            && $this->settings->hasCredentials();
    }

    public function createCheckout(User $user, Plan $plan, array $options = []): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'Gateway Stripe não está configurado.',
            ];
        }

        try {
            $customer = $this->getOrCreateCustomer($user);

            $lineItems = [
                [
                    'price_data' => [
                        'currency' => strtolower($plan->currency ?? 'brl'),
                        'product_data' => [
                            'name' => $plan->name,
                            'description' => $plan->description ?? "Plano {$plan->name}",
                        ],
                        'unit_amount' => $plan->price_cents,
                    ],
                    'quantity' => 1,
                ],
            ];

            $mode = 'payment';
            if ($plan->interval === 'monthly' || $plan->interval === 'yearly') {
                $lineItems[0]['price_data']['recurring'] = [
                    'interval' => $plan->interval === 'yearly' ? 'year' : 'month',
                ];
                $mode = 'subscription';
            }

            $successUrl = $options['success_url'] ?? url('/subscription?success=1');
            $cancelUrl = $options['cancel_url'] ?? url('/plans?canceled=1');

            $sessionParams = [
                'customer' => $customer->id,
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => $mode,
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                ],
            ];

            $session = StripeSession::create($sessionParams);

            $subscription = $this->subscriptionService->createPendingSubscription(
                $user, 
                $plan, 
                'stripe', 
                $session->id
            );

            $payment = Payment::create([
                'subscription_id' => $subscription->id,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'amount_cents' => $plan->price_cents,
                'currency' => $plan->currency ?? 'BRL',
                'status' => Payment::STATUS_PENDING,
                'provider' => 'stripe',
                'provider_reference' => $session->id,
                'metadata' => [
                    'checkout_session_id' => $session->id,
                    'checkout_url' => $session->url,
                ],
            ]);

            Log::info('Stripe checkout created', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'session_id' => $session->id,
            ]);

            return [
                'success' => true,
                'subscription_id' => $subscription->id,
                'payment_id' => $payment->id,
                'checkout_url' => $session->url,
                'session_id' => $session->id,
                'status' => 'pending_payment',
                'message' => 'Redirecionando para o pagamento...',
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout error', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Erro ao criar checkout: ' . $e->getMessage(),
            ];
        }
    }

    public function handleWebhook(array $payload): array
    {
        $event = $payload['event'] ?? null;
        $signature = $payload['signature'] ?? null;
        $rawPayload = $payload['raw_payload'] ?? null;

        if (!$event && $rawPayload && $signature && $this->settings?->webhook_secret) {
            try {
                $event = Webhook::constructEvent(
                    $rawPayload,
                    $signature,
                    $this->settings->webhook_secret
                );
            } catch (SignatureVerificationException $e) {
                Log::warning('Stripe webhook signature verification failed', [
                    'error' => $e->getMessage(),
                ]);
                return ['success' => false, 'error' => 'Invalid signature'];
            }
        }

        if (!$event) {
            return ['success' => false, 'error' => 'No event provided'];
        }

        $eventType = is_object($event) ? $event->type : ($event['type'] ?? null);
        $eventData = is_object($event) ? $event->data->object : ($event['data']['object'] ?? null);

        Log::info('Stripe webhook received', ['type' => $eventType]);

        switch ($eventType) {
            case 'checkout.session.completed':
                return $this->handleCheckoutCompleted($eventData);

            case 'payment_intent.succeeded':
                return $this->handlePaymentSucceeded($eventData);

            case 'payment_intent.payment_failed':
                return $this->handlePaymentFailed($eventData);

            case 'customer.subscription.deleted':
                return $this->handleSubscriptionDeleted($eventData);

            case 'customer.subscription.updated':
                return $this->handleSubscriptionUpdated($eventData);

            case 'invoice.paid':
                return $this->handleInvoicePaid($eventData);

            case 'invoice.payment_failed':
                return $this->handleInvoicePaymentFailed($eventData);

            default:
                Log::info('Stripe webhook event not handled', ['type' => $eventType]);
                return ['success' => true, 'message' => 'Event not handled'];
        }
    }

    protected function handleCheckoutCompleted($session): array
    {
        $sessionId = is_object($session) ? $session->id : ($session['id'] ?? null);
        $paymentStatus = is_object($session) ? $session->payment_status : ($session['payment_status'] ?? null);
        $stripeSubscriptionId = is_object($session) ? $session->subscription : ($session['subscription'] ?? null);
        $paymentIntentId = is_object($session) ? $session->payment_intent : ($session['payment_intent'] ?? null);
        
        if ($paymentStatus !== 'paid') {
            Log::info('Stripe checkout completed but payment not yet paid', [
                'session_id' => $sessionId,
                'payment_status' => $paymentStatus,
            ]);
            return ['success' => true, 'message' => 'Waiting for payment confirmation'];
        }
        
        $payment = Payment::where('provider_reference', $sessionId)->first();
        
        if ($payment) {
            if ($stripeSubscriptionId && $payment->subscription) {
                $payment->subscription->update([
                    'provider_reference' => $stripeSubscriptionId,
                    'metadata' => array_merge($payment->subscription->metadata ?? [], [
                        'stripe_session_id' => $sessionId,
                        'stripe_subscription_id' => $stripeSubscriptionId,
                    ]),
                ]);
            }
            
            if ($paymentIntentId) {
                $payment->update([
                    'provider_reference' => $paymentIntentId,
                    'metadata' => array_merge($payment->metadata ?? [], [
                        'stripe_session_id' => $sessionId,
                        'stripe_payment_intent_id' => $paymentIntentId,
                    ]),
                ]);
            }
            
            $this->subscriptionService->confirmPayment($payment);

            Log::info('Stripe checkout completed', [
                'session_id' => $sessionId,
                'payment_id' => $payment->id,
                'stripe_subscription_id' => $stripeSubscriptionId,
                'payment_intent_id' => $paymentIntentId,
            ]);

            return ['success' => true, 'message' => 'Payment completed'];
        }

        return ['success' => false, 'error' => 'Payment not found'];
    }

    protected function handlePaymentSucceeded($paymentIntent): array
    {
        $intentId = is_object($paymentIntent) ? $paymentIntent->id : ($paymentIntent['id'] ?? null);
        
        $payment = Payment::where('provider_reference', $intentId)->first();
        
        if ($payment && $payment->isPending()) {
            $this->subscriptionService->confirmPayment($payment);
            
            Log::info('Stripe payment succeeded', ['intent_id' => $intentId]);
            return ['success' => true, 'message' => 'Payment marked as paid'];
        }

        return ['success' => true, 'message' => 'Payment already processed or not found'];
    }

    protected function handlePaymentFailed($paymentIntent): array
    {
        $intentId = is_object($paymentIntent) ? $paymentIntent->id : ($paymentIntent['id'] ?? null);
        $failureMessage = is_object($paymentIntent) 
            ? ($paymentIntent->last_payment_error->message ?? 'Payment failed')
            : ($paymentIntent['last_payment_error']['message'] ?? 'Payment failed');
        
        $payment = Payment::where('provider_reference', $intentId)->first();
        
        if ($payment && $payment->isPending()) {
            $payment->markAsFailed($failureMessage);
            
            Log::info('Stripe payment failed', [
                'intent_id' => $intentId,
                'reason' => $failureMessage,
            ]);

            return ['success' => true, 'message' => 'Payment marked as failed'];
        }

        return ['success' => true, 'message' => 'Payment already processed or not found'];
    }

    protected function handleSubscriptionDeleted($subscription): array
    {
        $subscriptionId = is_object($subscription) ? $subscription->id : ($subscription['id'] ?? null);
        
        $localSub = Subscription::where('provider', 'stripe')
            ->where('provider_reference', $subscriptionId)
            ->first();
        
        if ($localSub && $localSub->isActive()) {
            $localSub->update([
                'status' => Subscription::STATUS_CANCELED,
                'canceled_at' => now(),
            ]);

            Log::info('Stripe subscription canceled via webhook', [
                'stripe_subscription_id' => $subscriptionId,
                'local_subscription_id' => $localSub->id,
            ]);

            return ['success' => true, 'message' => 'Subscription canceled'];
        }

        return ['success' => true, 'message' => 'Subscription not found or already canceled'];
    }

    protected function handleSubscriptionUpdated($subscription): array
    {
        Log::info('Stripe subscription updated', [
            'subscription_id' => is_object($subscription) ? $subscription->id : ($subscription['id'] ?? null),
        ]);
        
        return ['success' => true, 'message' => 'Subscription update noted'];
    }

    protected function handleInvoicePaid($invoice): array
    {
        $subscriptionId = is_object($invoice) ? $invoice->subscription : ($invoice['subscription'] ?? null);
        
        if ($subscriptionId) {
            $localSub = Subscription::where('provider', 'stripe')
                ->where('provider_reference', $subscriptionId)
                ->first();
            
            if ($localSub) {
                $this->subscriptionService->reactivate($localSub);
                
                Log::info('Stripe invoice paid - subscription renewed', [
                    'subscription_id' => $subscriptionId,
                ]);

                return ['success' => true, 'message' => 'Subscription renewed'];
            }
        }

        return ['success' => true, 'message' => 'Invoice processed'];
    }

    protected function handleInvoicePaymentFailed($invoice): array
    {
        $subscriptionId = is_object($invoice) ? $invoice->subscription : ($invoice['subscription'] ?? null);
        
        if ($subscriptionId) {
            $localSub = Subscription::where('provider', 'stripe')
                ->where('provider_reference', $subscriptionId)
                ->first();
            
            if ($localSub && $localSub->isActive()) {
                $localSub->update(['status' => Subscription::STATUS_PAST_DUE]);
                
                Log::info('Stripe invoice payment failed - subscription past due', [
                    'subscription_id' => $subscriptionId,
                ]);

                return ['success' => true, 'message' => 'Subscription marked as past due'];
            }
        }

        return ['success' => true, 'message' => 'Invoice failure processed'];
    }

    public function cancelSubscription(Subscription $subscription): bool
    {
        if (!$this->isConfigured()) {
            $this->subscriptionService->cancel($subscription, false);
            return true;
        }

        try {
            if ($subscription->provider_reference && str_starts_with($subscription->provider_reference, 'sub_')) {
                $stripeSubscription = \Stripe\Subscription::retrieve($subscription->provider_reference);
                $stripeSubscription->cancel();
            }

            $this->subscriptionService->cancel($subscription, false);

            Log::info('Stripe subscription canceled', [
                'subscription_id' => $subscription->id,
                'provider_reference' => $subscription->provider_reference,
            ]);

            return true;
        } catch (ApiErrorException $e) {
            Log::error('Stripe cancel subscription error', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);

            $this->subscriptionService->cancel($subscription, false);
            return true;
        }
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
        if (!$this->isConfigured()) {
            return false;
        }

        try {
            $payment = Payment::where('provider_reference', $paymentReference)->first();
            
            if (!$payment) {
                return false;
            }

            $refundParams = ['payment_intent' => $paymentReference];
            if ($amountCents) {
                $refundParams['amount'] = $amountCents;
            }

            \Stripe\Refund::create($refundParams);

            $payment->update(['status' => Payment::STATUS_REFUNDED]);

            Log::info('Stripe refund created', [
                'payment_reference' => $paymentReference,
                'amount' => $amountCents,
            ]);

            return true;
        } catch (ApiErrorException $e) {
            Log::error('Stripe refund error', [
                'payment_reference' => $paymentReference,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    protected function getOrCreateCustomer(User $user): Customer
    {
        $customerId = $user->metadata['stripe_customer_id'] ?? null;

        if ($customerId) {
            try {
                return Customer::retrieve($customerId);
            } catch (ApiErrorException $e) {
                Log::warning('Stripe customer not found, creating new', [
                    'user_id' => $user->id,
                    'old_customer_id' => $customerId,
                ]);
            }
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update([
            'metadata' => array_merge($user->metadata ?? [], [
                'stripe_customer_id' => $customer->id,
            ]),
        ]);

        return $customer;
    }

    public function testConnection(): array
    {
        if (!$this->settings || !$this->settings->secret_key) {
            return [
                'success' => false,
                'error' => 'Chave secreta não configurada.',
            ];
        }

        try {
            Stripe::setApiKey($this->settings->secret_key);
            
            $balance = \Stripe\Balance::retrieve();

            return [
                'success' => true,
                'message' => 'Conexão com Stripe estabelecida com sucesso.',
                'mode' => $this->settings->sandbox_mode ? 'sandbox' : 'live',
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => 'Erro de conexão: ' . $e->getMessage(),
            ];
        }
    }
}
