<?php

namespace App\Services;

use App\Models\User;
use App\Models\UsageCounter;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;

class UsageService
{
    const ERROR_SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED';
    const ERROR_SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED';
    const ERROR_PLAN_LIMIT_REACHED = 'PLAN_LIMIT_REACHED';
    const ERROR_DAILY_LIMIT_REACHED = 'DAILY_LIMIT_REACHED';

    public function canPerformConsulta(User $user): array
    {
        $subscription = $user->activeSubscription;
        
        if (!$subscription) {
            return [
                'allowed' => false,
                'error' => self::ERROR_SUBSCRIPTION_REQUIRED,
                'message' => 'Você precisa de uma assinatura ativa para realizar consultas.',
            ];
        }

        if (!$subscription->canAccess()) {
            return [
                'allowed' => false,
                'error' => self::ERROR_SUBSCRIPTION_EXPIRED,
                'message' => 'Sua assinatura expirou. Por favor, renove para continuar.',
            ];
        }

        $usage = $this->getOrCreateUsageCounter($user, $subscription);

        if (!$usage->hasMonthlyQuota()) {
            return [
                'allowed' => false,
                'error' => self::ERROR_PLAN_LIMIT_REACHED,
                'message' => 'Você atingiu o limite mensal de consultas do seu plano.',
                'usage' => [
                    'used' => $usage->used_count,
                    'limit' => $usage->limit_count,
                ],
            ];
        }

        if (!$usage->hasDailyQuota()) {
            return [
                'allowed' => false,
                'error' => self::ERROR_DAILY_LIMIT_REACHED,
                'message' => 'Você atingiu o limite diário de consultas do seu plano.',
                'usage' => [
                    'daily_used' => $usage->daily_used,
                    'daily_limit' => $usage->daily_limit,
                ],
            ];
        }

        return [
            'allowed' => true,
            'subscription' => $subscription,
            'usage' => $usage,
        ];
    }

    public function recordUsage(User $user): bool
    {
        $subscription = $user->activeSubscription;
        
        if (!$subscription) {
            Log::warning('Attempted to record usage without subscription', ['user_id' => $user->id]);
            return false;
        }

        $usage = $this->getOrCreateUsageCounter($user, $subscription);
        
        $result = $usage->incrementUsage();

        Log::info('Usage recorded', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'used_count' => $usage->used_count,
            'daily_used' => $usage->daily_used,
        ]);

        return $result;
    }

    public function getUsageStats(User $user): array
    {
        $subscription = $user->activeSubscription;
        
        if (!$subscription) {
            return [
                'has_subscription' => false,
                'plan' => null,
                'usage' => null,
            ];
        }

        $usage = $this->getOrCreateUsageCounter($user, $subscription);
        $plan = $subscription->plan;

        return [
            'has_subscription' => true,
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
            ],
            'subscription' => [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'started_at' => $subscription->started_at?->toIso8601String(),
                'current_period_end' => $subscription->current_period_end?->toIso8601String(),
                'days_remaining' => $subscription->days_remaining,
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
            ],
            'usage' => [
                'monthly' => [
                    'used' => $usage->used_count,
                    'limit' => $usage->limit_count,
                    'remaining' => $usage->remaining_monthly,
                    'percentage' => round($usage->usage_percentage, 1),
                ],
                'daily' => [
                    'used' => $usage->daily_used,
                    'limit' => $usage->daily_limit,
                    'remaining' => $usage->remaining_daily,
                ],
                'period_key' => $usage->period_key,
            ],
        ];
    }

    public function hasFeatureAccess(User $user, string $feature): bool
    {
        $subscription = $user->activeSubscription;
        
        if (!$subscription || !$subscription->canAccess()) {
            return false;
        }

        $plan = $subscription->plan;
        
        return $plan->hasFeature($feature);
    }

    public function resetMonthlyUsage(User $user): void
    {
        $subscription = $user->activeSubscription;
        
        if (!$subscription) {
            return;
        }

        $periodKey = UsageCounter::getCurrentPeriodKey();
        
        UsageCounter::updateOrCreate(
            [
                'user_id' => $user->id,
                'period_key' => $periodKey,
            ],
            [
                'subscription_id' => $subscription->id,
                'used_count' => 0,
                'daily_used' => 0,
                'limit_count' => $subscription->plan->monthly_limit,
                'daily_limit' => $subscription->plan->daily_limit,
                'last_reset_date' => now()->toDateString(),
            ]
        );
    }

    protected function getOrCreateUsageCounter(User $user, Subscription $subscription): UsageCounter
    {
        $periodKey = UsageCounter::getCurrentPeriodKey();
        $plan = $subscription->plan;

        return UsageCounter::firstOrCreate(
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
}
