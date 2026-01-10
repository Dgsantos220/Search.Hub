<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\User;
use App\Models\UsageCounter;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function subscribe(User $user, Plan $plan, string $provider = 'manual', ?string $providerReference = null, ?string $initialStatus = null): Subscription
    {
        return DB::transaction(function () use ($user, $plan, $provider, $providerReference, $initialStatus) {
            $existingActive = $user->activeSubscription;
            if ($existingActive) {
                $existingActive->update([
                    'status' => Subscription::STATUS_CANCELED,
                    'canceled_at' => now(),
                ]);
            }

            $now = Carbon::now();
            $periodEnd = $this->calculatePeriodEnd($plan, $now);
            
            $status = $initialStatus ?? Subscription::STATUS_ACTIVE;

            if (!$initialStatus && $plan->trial_days && $plan->trial_days > 0 && !$this->hasUsedTrial($user)) {
                $status = Subscription::STATUS_TRIALING;
                $periodEnd = $now->copy()->addDays($plan->trial_days);
            }

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => $status,
                'started_at' => $now,
                'current_period_start' => $now,
                'current_period_end' => $periodEnd,
                'next_billing_at' => $periodEnd,
                'provider' => $provider,
                'provider_reference' => $providerReference,
            ]);

            $this->initializeUsageCounter($user, $subscription, $plan);

            Log::info('Subscription created', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'subscription_id' => $subscription->id,
                'status' => $status,
            ]);

            return $subscription;
        });
    }

    public function changePlan(Subscription $subscription, Plan $newPlan, bool $immediate = true): Subscription
    {
        return DB::transaction(function () use ($subscription, $newPlan, $immediate) {
            $oldPlan = $subscription->plan;
            
            if ($immediate) {
                $now = Carbon::now();
                $periodEnd = $this->calculatePeriodEnd($newPlan, $now);
                
                $subscription->update([
                    'plan_id' => $newPlan->id,
                    'current_period_start' => $now,
                    'current_period_end' => $periodEnd,
                    'next_billing_at' => $periodEnd,
                    'status' => Subscription::STATUS_ACTIVE,
                ]);

                $this->updateUsageCounterLimits($subscription, $newPlan);
            } else {
                $subscription->update([
                    'metadata' => array_merge($subscription->metadata ?? [], [
                        'pending_plan_change' => $newPlan->id,
                    ]),
                ]);
            }

            Log::info('Plan changed', [
                'subscription_id' => $subscription->id,
                'old_plan_id' => $oldPlan->id,
                'new_plan_id' => $newPlan->id,
                'immediate' => $immediate,
            ]);

            return $subscription->fresh();
        });
    }

    public function cancel(Subscription $subscription, bool $atPeriodEnd = true): Subscription
    {
        return DB::transaction(function () use ($subscription, $atPeriodEnd) {
            if ($atPeriodEnd) {
                $subscription->update([
                    'cancel_at_period_end' => true,
                    'canceled_at' => now(),
                ]);
            } else {
                $subscription->update([
                    'status' => Subscription::STATUS_CANCELED,
                    'canceled_at' => now(),
                    'cancel_at_period_end' => false,
                ]);
            }

            Log::info('Subscription canceled', [
                'subscription_id' => $subscription->id,
                'at_period_end' => $atPeriodEnd,
            ]);

            return $subscription->fresh();
        });
    }

    public function reactivate(Subscription $subscription): Subscription
    {
        return DB::transaction(function () use ($subscription) {
            $now = Carbon::now();
            $plan = $subscription->plan;
            $periodEnd = $this->calculatePeriodEnd($plan, $now);

            $subscription->update([
                'status' => Subscription::STATUS_ACTIVE,
                'canceled_at' => null,
                'cancel_at_period_end' => false,
                'current_period_start' => $now,
                'current_period_end' => $periodEnd,
                'next_billing_at' => $periodEnd,
            ]);

            $this->initializeUsageCounter($subscription->user, $subscription, $plan);

            $this->notificationService->sendSubscriptionActivated($subscription);

            Log::info('Subscription reactivated', [
                'subscription_id' => $subscription->id,
            ]);

            return $subscription->fresh();
        });
    }

    public function checkAndExpireSubscriptions(): int
    {
        $expiredCount = 0;
        
        $subscriptions = Subscription::whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_TRIALING])
            ->where('current_period_end', '<', now())
            ->get();

        foreach ($subscriptions as $subscription) {
            if ($subscription->cancel_at_period_end) {
                $subscription->update(['status' => Subscription::STATUS_EXPIRED]);
            } else {
                $subscription->update(['status' => Subscription::STATUS_PAST_DUE]);
            }
            $expiredCount++;
        }

        return $expiredCount;
    }

    public function createPayment(Subscription $subscription, int $amountCents, string $provider = 'manual'): Payment
    {
        return Payment::create([
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'plan_id' => $subscription->plan_id,
            'amount_cents' => $amountCents,
            'currency' => $subscription->plan->currency ?? 'BRL',
            'status' => Payment::STATUS_PENDING,
            'provider' => $provider,
        ]);
    }

    public function confirmPayment(Payment $payment): Subscription
    {
        return DB::transaction(function () use ($payment) {
            $payment->markAsPaid();

            $subscription = $payment->subscription;
            if ($subscription) {
                if ($subscription->status === Subscription::STATUS_PAST_DUE || $subscription->status === Subscription::STATUS_TRIALING) {
                    $this->activateSubscription($subscription);
                }
            }

            return $subscription;
        });
    }

    public function createPendingSubscription(User $user, Plan $plan, string $provider = 'stripe', ?string $providerReference = null): Subscription
    {
        return DB::transaction(function () use ($user, $plan, $provider, $providerReference) {
            $existingPending = Subscription::where('user_id', $user->id)
                ->where('status', Subscription::STATUS_PAST_DUE)
                ->where('provider', $provider)
                ->first();
            
            if ($existingPending) {
                $existingPending->update([
                    'plan_id' => $plan->id,
                    'provider_reference' => $providerReference,
                ]);
                return $existingPending;
            }

            $now = Carbon::now();
            $periodEnd = $this->calculatePeriodEnd($plan, $now);

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => Subscription::STATUS_PAST_DUE,
                'started_at' => $now,
                'current_period_start' => $now,
                'current_period_end' => $periodEnd,
                'next_billing_at' => $periodEnd,
                'provider' => $provider,
                'provider_reference' => $providerReference,
            ]);

            Log::info('Pending subscription created', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'subscription_id' => $subscription->id,
                'provider' => $provider,
            ]);

            return $subscription;
        });
    }

    public function activateSubscription(Subscription $subscription): Subscription
    {
        return DB::transaction(function () use ($subscription) {
            $now = Carbon::now();
            $plan = $subscription->plan;
            $periodEnd = $this->calculatePeriodEnd($plan, $now);

            $subscription->update([
                'status' => Subscription::STATUS_ACTIVE,
                'current_period_start' => $now,
                'current_period_end' => $periodEnd,
                'next_billing_at' => $periodEnd,
            ]);

            $this->initializeUsageCounter($subscription->user, $subscription, $plan);

            $this->notificationService->sendSubscriptionActivated($subscription);

            Log::info('Subscription activated', [
                'subscription_id' => $subscription->id,
                'user_id' => $subscription->user_id,
            ]);

            return $subscription->fresh();
        });
    }

    protected function calculatePeriodEnd(Plan $plan, Carbon $start): Carbon
    {
        return match ($plan->interval) {
            'monthly' => $start->copy()->addMonth(),
            'yearly' => $start->copy()->addYear(),
            'one_time' => $start->copy()->addYears(100),
            default => $start->copy()->addMonth(),
        };
    }

    protected function hasUsedTrial(User $user): bool
    {
        return Subscription::where('user_id', $user->id)
            ->where('status', Subscription::STATUS_TRIALING)
            ->orWhere(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->whereNotNull('metadata->used_trial');
            })
            ->exists();
    }

    protected function initializeUsageCounter(User $user, Subscription $subscription, Plan $plan): UsageCounter
    {
        $periodKey = UsageCounter::getCurrentPeriodKey();
        
        return UsageCounter::updateOrCreate(
            [
                'user_id' => $user->id,
                'period_key' => $periodKey,
            ],
            [
                'subscription_id' => $subscription->id,
                'limit_count' => $plan->monthly_limit,
                'daily_limit' => $plan->daily_limit,
                'used_count' => 0,
                'daily_used' => 0,
                'last_reset_date' => now()->toDateString(),
            ]
        );
    }

    protected function updateUsageCounterLimits(Subscription $subscription, Plan $plan): void
    {
        $periodKey = UsageCounter::getCurrentPeriodKey();
        
        UsageCounter::where('user_id', $subscription->user_id)
            ->where('period_key', $periodKey)
            ->update([
                'limit_count' => $plan->monthly_limit,
                'daily_limit' => $plan->daily_limit,
            ]);
    }
}
