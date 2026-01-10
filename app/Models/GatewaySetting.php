<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class GatewaySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'enabled',
        'public_key',
        'secret_key',
        'access_token',
        'webhook_secret',
        'sandbox_mode',
        'metadata',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'sandbox_mode' => 'boolean',
        'metadata' => 'array',
    ];

    protected $hidden = [
        'secret_key',
        'access_token',
        'webhook_secret',
    ];

    public function setSecretKeyAttribute($value): void
    {
        $this->attributes['secret_key'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getSecretKeyAttribute($value): ?string
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function setAccessTokenAttribute($value): void
    {
        $this->attributes['access_token'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getAccessTokenAttribute($value): ?string
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function setWebhookSecretAttribute($value): void
    {
        $this->attributes['webhook_secret'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getWebhookSecretAttribute($value): ?string
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public static function getByProvider(string $provider): ?self
    {
        return self::where('provider', $provider)->first();
    }

    public static function isEnabled(string $provider): bool
    {
        $setting = self::getByProvider($provider);
        return $setting && $setting->enabled;
    }

    public static function getEnabledGateways(): array
    {
        return self::where('enabled', true)->pluck('provider')->toArray();
    }

    public function hasCredentials(): bool
    {
        if ($this->provider === 'stripe') {
            return !empty($this->public_key) && !empty($this->attributes['secret_key']);
        }
        
        if ($this->provider === 'mercadopago') {
            return !empty($this->attributes['access_token']);
        }
        
        return false;
    }

    public function toSafeArray(): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'enabled' => $this->enabled,
            'has_public_key' => !empty($this->public_key),
            'has_secret_key' => !empty($this->attributes['secret_key']),
            'has_access_token' => !empty($this->attributes['access_token']),
            'has_webhook_secret' => !empty($this->attributes['webhook_secret']),
            'sandbox_mode' => $this->sandbox_mode,
            'has_credentials' => $this->hasCredentials(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
