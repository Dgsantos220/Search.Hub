<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class UsageCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_id',
        'period_key',
        'used_count',
        'limit_count',
        'daily_used',
        'daily_limit',
        'last_reset_date',
        'metadata',
    ];

    protected $casts = [
        'used_count' => 'integer',
        'limit_count' => 'integer',
        'daily_used' => 'integer',
        'daily_limit' => 'integer',
        'last_reset_date' => 'date',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public static function getCurrentPeriodKey(): string
    {
        return Carbon::now()->format('Y-m');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPeriod($query, string $periodKey)
    {
        return $query->where('period_key', $periodKey);
    }

    public function scopeCurrent($query)
    {
        return $query->where('period_key', self::getCurrentPeriodKey());
    }

    public function hasMonthlyQuota(): bool
    {
        if ($this->limit_count <= 0) {
            return true;
        }
        return $this->used_count < $this->limit_count;
    }

    public function hasDailyQuota(): bool
    {
        $this->resetDailyIfNeeded();
        
        if ($this->daily_limit <= 0) {
            return true;
        }
        return $this->daily_used < $this->daily_limit;
    }

    public function hasQuota(): bool
    {
        return $this->hasMonthlyQuota() && $this->hasDailyQuota();
    }

    public function incrementUsage(): bool
    {
        $this->resetDailyIfNeeded();
        
        $this->used_count++;
        $this->daily_used++;
        
        return $this->save();
    }

    public function resetDailyIfNeeded(): void
    {
        $today = Carbon::today();
        
        if (!$this->last_reset_date || !$today->isSameDay($this->last_reset_date)) {
            $this->daily_used = 0;
            $this->last_reset_date = $today;
        }
    }

    public function getRemainingMonthlyAttribute(): int
    {
        if ($this->limit_count <= 0) {
            return -1;
        }
        return max(0, $this->limit_count - $this->used_count);
    }

    public function getRemainingDailyAttribute(): int
    {
        $this->resetDailyIfNeeded();
        
        if ($this->daily_limit <= 0) {
            return -1;
        }
        return max(0, $this->daily_limit - $this->daily_used);
    }

    public function getUsagePercentageAttribute(): float
    {
        if ($this->limit_count <= 0) {
            return 0;
        }
        return min(100, ($this->used_count / $this->limit_count) * 100);
    }
}
