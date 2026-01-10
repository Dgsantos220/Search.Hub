<?php

namespace App\Services\Billing;

use App\Contracts\BillingProvider;
use App\Models\GatewaySetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use InvalidArgumentException;

class BillingService
{
    protected SubscriptionService $subscriptionService;
    protected array $providers = [];

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function getProvider(string $providerName): BillingProvider
    {
        if (!isset($this->providers[$providerName])) {
            $this->providers[$providerName] = $this->createProvider($providerName);
        }

        return $this->providers[$providerName];
    }

    protected function createProvider(string $providerName): BillingProvider
    {
        return match ($providerName) {
            'manual' => new ManualProvider($this->subscriptionService),
            'stripe' => new StripeProvider($this->subscriptionService),
            'mercadopago' => new MercadoPagoProvider($this->subscriptionService),
            default => throw new InvalidArgumentException("Unknown provider: {$providerName}"),
        };
    }

    public function getDefaultProvider(): string
    {
        $enabledGateways = GatewaySetting::getEnabledGateways();
        
        if (in_array('stripe', $enabledGateways)) {
            return 'stripe';
        }
        
        if (in_array('mercadopago', $enabledGateways)) {
            return 'mercadopago';
        }
        
        return 'manual';
    }

    public function getEnabledProviders(): array
    {
        $providers = ['manual'];
        
        $stripeSettings = GatewaySetting::getByProvider('stripe');
        if ($stripeSettings && $stripeSettings->enabled && $stripeSettings->hasCredentials()) {
            $providers[] = 'stripe';
        }
        
        $mpSettings = GatewaySetting::getByProvider('mercadopago');
        if ($mpSettings && $mpSettings->enabled && $mpSettings->hasCredentials()) {
            $providers[] = 'mercadopago';
        }
        
        return $providers;
    }

    public function createCheckout(User $user, Plan $plan, string $providerName = null, array $options = []): array
    {
        $providerName = $providerName ?? $this->getDefaultProvider();
        $provider = $this->getProvider($providerName);
        
        $result = $provider->createCheckout($user, $plan, $options);
        
        if (isset($result['checkout_url'])) {
            $result['url'] = $result['checkout_url'];
            session()->flash('url', $result['checkout_url']);
        }
        
        return $result;
    }

    public function handleWebhook(string $providerName, array $payload): array
    {
        $provider = $this->getProvider($providerName);
        return $provider->handleWebhook($payload);
    }

    public function cancelSubscription(Subscription $subscription): bool
    {
        $provider = $this->getProvider($subscription->provider);
        return $provider->cancelSubscription($subscription);
    }

    public function changePlan(Subscription $subscription, Plan $newPlan): bool
    {
        $provider = $this->getProvider($subscription->provider);
        return $provider->changePlan($subscription, $newPlan);
    }

    public function refund(string $providerName, string $paymentReference, int $amountCents = null): bool
    {
        $provider = $this->getProvider($providerName);
        return $provider->refund($paymentReference, $amountCents);
    }

    public function testConnection(string $providerName): array
    {
        $provider = $this->getProvider($providerName);
        
        if (!method_exists($provider, 'testConnection')) {
            return [
                'success' => false,
                'error' => 'Provider does not support connection testing.',
            ];
        }
        
        return $provider->testConnection();
    }
}
