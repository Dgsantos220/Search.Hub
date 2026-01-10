<?php

namespace App\Contracts;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;

interface BillingProvider
{
    public function getName(): string;

    public function createCheckout(User $user, Plan $plan, array $options = []): array;

    public function handleWebhook(array $payload): array;

    public function cancelSubscription(Subscription $subscription): bool;

    public function changePlan(Subscription $subscription, Plan $newPlan): bool;

    public function getSubscriptionStatus(Subscription $subscription): ?string;

    public function refund(string $paymentReference, int $amountCents = null): bool;
}
