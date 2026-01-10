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
use Illuminate\Support\Facades\Http;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Exceptions\MPApiException;

class MercadoPagoProvider implements BillingProvider
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
        $this->settings = GatewaySetting::getByProvider('mercadopago');
        
        if ($this->settings && $this->settings->access_token) {
            MercadoPagoConfig::setAccessToken($this->settings->access_token);
        }
    }

    public function getName(): string
    {
        return 'mercadopago';
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
                'error' => 'Gateway MercadoPago não está configurado.',
            ];
        }

        try {
            $tempReference = "mp_" . $user->id . "_" . time();
            
            $subscription = $this->subscriptionService->createPendingSubscription(
                $user,
                $plan,
                'mercadopago',
                $tempReference
            );

            $externalReference = "sub_{$subscription->id}_user_{$user->id}_" . time();

            $successUrl = $options['success_url'] ?? url('/subscription?success=1');
            $failureUrl = $options['failure_url'] ?? url('/plans?failed=1');
            $pendingUrl = $options['pending_url'] ?? url('/subscription?pending=1');

            $preferenceData = [
                'items' => [
                    [
                        'id' => (string) $plan->id,
                        'title' => $plan->name,
                        'description' => $plan->description ?? "Assinatura do plano {$plan->name}",
                        'quantity' => 1,
                        'currency_id' => strtoupper($plan->currency ?? 'BRL'),
                        'unit_price' => $plan->price_cents / 100,
                    ],
                ],
                'payer' => [
                    'email' => $user->email,
                    'name' => $user->name,
                ],
                'back_urls' => [
                    'success' => $successUrl,
                    'failure' => $failureUrl,
                    'pending' => $pendingUrl,
                ],
                'auto_return' => 'approved',
                'external_reference' => $externalReference,
                'notification_url' => url('/api/webhooks/mercadopago'),
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'subscription_id' => $subscription->id,
                ],
            ];

            $client = new PreferenceClient();
            $preference = $client->create($preferenceData);

            $subscription->update(['provider_reference' => $externalReference]);

            $payment = Payment::create([
                'subscription_id' => $subscription->id,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'amount_cents' => $plan->price_cents,
                'currency' => $plan->currency ?? 'BRL',
                'status' => Payment::STATUS_PENDING,
                'provider' => 'mercadopago',
                'provider_reference' => $externalReference,
                'metadata' => [
                    'preference_id' => $preference->id,
                    'init_point' => $preference->init_point,
                    'sandbox_init_point' => $preference->sandbox_init_point ?? null,
                ],
            ]);

            $checkoutUrl = $this->settings->sandbox_mode 
                ? ($preference->sandbox_init_point ?? $preference->init_point)
                : $preference->init_point;

            Log::info('MercadoPago checkout created', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'preference_id' => $preference->id,
                'external_reference' => $externalReference,
            ]);

            return [
                'success' => true,
                'subscription_id' => $subscription->id,
                'payment_id' => $payment->id,
                'checkout_url' => $checkoutUrl,
                'preference_id' => $preference->id,
                'status' => 'pending_payment',
                'message' => 'Redirecionando para o pagamento...',
            ];
        } catch (MPApiException $e) {
            Log::error('MercadoPago checkout error', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
                'api_response' => $e->getApiResponse()?->getContent(),
            ]);

            return [
                'success' => false,
                'error' => 'Erro ao criar checkout: ' . $e->getMessage(),
            ];
        } catch (\Exception $e) {
            Log::error('MercadoPago general error', [
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
        $type = $payload['type'] ?? $payload['action'] ?? null;
        $dataId = $payload['data']['id'] ?? null;

        Log::info('MercadoPago webhook received', [
            'type' => $type,
            'data_id' => $dataId,
            'payload' => $payload,
        ]);

        if (!$type || !$dataId) {
            return ['success' => false, 'error' => 'Invalid payload'];
        }

        switch ($type) {
            case 'payment':
            case 'payment.created':
            case 'payment.updated':
                return $this->handlePaymentNotification($dataId);

            case 'merchant_order':
                return $this->handleMerchantOrder($dataId);

            default:
                Log::info('MercadoPago webhook type not handled', ['type' => $type]);
                return ['success' => true, 'message' => 'Event type not handled'];
        }
    }

    protected function handlePaymentNotification(string $paymentId): array
    {
        if (!$this->isConfigured()) {
            return ['success' => false, 'error' => 'Provider not configured'];
        }

        try {
            $client = new PaymentClient();
            $mpPayment = $client->get((int) $paymentId);

            $externalReference = $mpPayment->external_reference;
            $status = $mpPayment->status;

            $payment = Payment::where('provider', 'mercadopago')
                ->where('provider_reference', $externalReference)
                ->first();

            if (!$payment) {
                Log::warning('MercadoPago payment not found', [
                    'mp_payment_id' => $paymentId,
                    'external_reference' => $externalReference,
                ]);
                return ['success' => false, 'error' => 'Payment not found'];
            }

            $payment->update([
                'metadata' => array_merge($payment->metadata ?? [], [
                    'mp_payment_id' => $paymentId,
                    'mp_status' => $status,
                    'mp_status_detail' => $mpPayment->status_detail,
                ]),
            ]);

            switch ($status) {
                case 'approved':
                    $this->subscriptionService->confirmPayment($payment);
                    Log::info('MercadoPago payment approved', [
                        'payment_id' => $payment->id,
                        'mp_payment_id' => $paymentId,
                    ]);
                    return ['success' => true, 'message' => 'Payment approved'];

                case 'pending':
                case 'in_process':
                case 'authorized':
                    Log::info('MercadoPago payment pending', [
                        'payment_id' => $payment->id,
                        'status' => $status,
                    ]);
                    return ['success' => true, 'message' => 'Payment pending'];

                case 'rejected':
                case 'cancelled':
                    $reason = $mpPayment->status_detail ?? $status;
                    $payment->markAsFailed($this->translateStatusDetail($reason));
                    Log::info('MercadoPago payment rejected', [
                        'payment_id' => $payment->id,
                        'reason' => $reason,
                    ]);
                    return ['success' => true, 'message' => 'Payment rejected'];

                case 'refunded':
                case 'charged_back':
                    $payment->update(['status' => Payment::STATUS_REFUNDED]);
                    Log::info('MercadoPago payment refunded', [
                        'payment_id' => $payment->id,
                    ]);
                    return ['success' => true, 'message' => 'Payment refunded'];

                default:
                    Log::info('MercadoPago unknown payment status', [
                        'status' => $status,
                    ]);
                    return ['success' => true, 'message' => 'Status not handled'];
            }
        } catch (MPApiException $e) {
            Log::error('MercadoPago get payment error', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    protected function handleMerchantOrder(string $orderId): array
    {
        Log::info('MercadoPago merchant order received', ['order_id' => $orderId]);
        return ['success' => true, 'message' => 'Merchant order processed'];
    }

    protected function translateStatusDetail(string $statusDetail): string
    {
        $translations = [
            'cc_rejected_bad_filled_card_number' => 'Número do cartão incorreto',
            'cc_rejected_bad_filled_date' => 'Data de validade incorreta',
            'cc_rejected_bad_filled_other' => 'Dados do cartão incorretos',
            'cc_rejected_bad_filled_security_code' => 'Código de segurança incorreto',
            'cc_rejected_blacklist' => 'Cartão bloqueado',
            'cc_rejected_call_for_authorize' => 'Pagamento não autorizado',
            'cc_rejected_card_disabled' => 'Cartão desabilitado',
            'cc_rejected_duplicated_payment' => 'Pagamento duplicado',
            'cc_rejected_high_risk' => 'Pagamento rejeitado por segurança',
            'cc_rejected_insufficient_amount' => 'Saldo insuficiente',
            'cc_rejected_invalid_installments' => 'Parcelas inválidas',
            'cc_rejected_max_attempts' => 'Limite de tentativas excedido',
            'cc_rejected_other_reason' => 'Pagamento rejeitado',
            'pending_contingency' => 'Pagamento pendente de análise',
            'pending_review_manual' => 'Pagamento em revisão',
        ];

        return $translations[$statusDetail] ?? $statusDetail;
    }

    public function cancelSubscription(Subscription $subscription): bool
    {
        $this->subscriptionService->cancel($subscription, false);

        Log::info('MercadoPago subscription canceled', [
            'subscription_id' => $subscription->id,
        ]);

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
        if (!$this->isConfigured()) {
            return false;
        }

        try {
            $payment = Payment::where('provider_reference', $paymentReference)->first();
            
            if (!$payment) {
                return false;
            }

            $mpPaymentId = $payment->metadata['mp_payment_id'] ?? null;
            
            if (!$mpPaymentId) {
                Log::warning('MercadoPago payment ID not found for refund', [
                    'payment_reference' => $paymentReference,
                ]);
                return false;
            }

            $refundData = [];
            if ($amountCents) {
                $refundData['amount'] = $amountCents / 100;
            }

            $response = Http::withToken($this->settings->access_token)
                ->post("https://api.mercadopago.com/v1/payments/{$mpPaymentId}/refunds", $refundData);

            if ($response->successful()) {
                $payment->update(['status' => Payment::STATUS_REFUNDED]);

                Log::info('MercadoPago refund created', [
                    'payment_reference' => $paymentReference,
                    'mp_payment_id' => $mpPaymentId,
                    'amount' => $amountCents,
                ]);

                return true;
            }

            Log::error('MercadoPago refund failed', [
                'payment_reference' => $paymentReference,
                'response' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('MercadoPago refund error', [
                'payment_reference' => $paymentReference,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function testConnection(): array
    {
        if (!$this->settings || !$this->settings->access_token) {
            return [
                'success' => false,
                'error' => 'Access token não configurado.',
            ];
        }

        try {
            MercadoPagoConfig::setAccessToken($this->settings->access_token);
            
            $response = Http::withToken($this->settings->access_token)
                ->get('https://api.mercadopago.com/users/me');

            if ($response->successful()) {
                $userData = $response->json();
                
                return [
                    'success' => true,
                    'message' => 'Conexão com MercadoPago estabelecida com sucesso.',
                    'mode' => $this->settings->sandbox_mode ? 'sandbox' : 'live',
                    'account' => $userData['email'] ?? 'N/A',
                ];
            }

            return [
                'success' => false,
                'error' => 'Erro de autenticação: ' . ($response->json()['message'] ?? 'Unknown error'),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro de conexão: ' . $e->getMessage(),
            ];
        }
    }
}
