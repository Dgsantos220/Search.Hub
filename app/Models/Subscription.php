<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'started_at',
        'current_period_start',
        'current_period_end',
        'canceled_at',
        'cancel_at_period_end',
        'next_billing_at',
        'provider',
        'provider_reference',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'canceled_at' => 'datetime',
        'next_billing_at' => 'datetime',
        'cancel_at_period_end' => 'boolean',
        'metadata' => 'array',
    ];

    const STATUS_TRIALING = 'trialing';
    const STATUS_ACTIVE = 'active';
    const STATUS_PAST_DUE = 'past_due';
    const STATUS_CANCELED = 'canceled';
    const STATUS_EXPIRED = 'expired';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function usageCounters(): HasMany
    {
        return $this->hasMany(UsageCounter::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_ACTIVE, self::STATUS_TRIALING]);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function isActive(): bool
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIALING]);
    }

    public function isTrialing(): bool
    {
        return $this->status === self::STATUS_TRIALING;
    }

    public function isCanceled(): bool
    {
        return $this->status === self::STATUS_CANCELED;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED;
    }

    public function isPastDue(): bool
    {
        return $this->status === self::STATUS_PAST_DUE;
    }

    public function isWithinPeriod(): bool
    {
        if (!$this->current_period_end) {
            return true;
        }
        return Carbon::now()->lt($this->current_period_end);
    }

    public function canAccess(): bool
    {
        return $this->isActive() && $this->isWithinPeriod();
    }

    public function daysRemaining(): int
    {
        if (!$this->current_period_end) {
            return 0;
        }
        return max(0, Carbon::now()->diffInDays($this->current_period_end, false));
    }

    public function getDaysRemainingAttribute(): int
    {
        return $this->daysRemaining();
    }
}
