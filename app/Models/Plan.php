<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_cents',
        'currency',
        'interval',
        'features',
        'limits',
        'trial_days',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'limits' => 'array',
        'is_active' => 'boolean',
        'price_cents' => 'integer',
        'trial_days' => 'integer',
        'sort_order' => 'integer',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price_cents');
    }

    public function getPriceAttribute(): float
    {
        return $this->price_cents / 100;
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'R$ ' . number_format($this->price, 2, ',', '.');
    }

    public function getMonthlyLimitAttribute(): int
    {
        return $this->limits['consultas_por_mes'] ?? 0;
    }

    public function getDailyLimitAttribute(): int
    {
        return $this->limits['consultas_por_dia'] ?? 0;
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->features ?? [];
        return in_array($feature, $features);
    }

    public function getFeaturesList(): array
    {
        return $this->features ?? [];
    }
}
