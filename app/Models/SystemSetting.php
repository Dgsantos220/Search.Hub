<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    protected $casts = [
        'value' => 'encrypted',
    ];

    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set(string $key, $value, string $type = 'string'): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
    }

    public static function generateApiKey(string $prefix = 'sk'): string
    {
        return $prefix . '_' . Str::random(32);
    }

    public static function getApiKeys(): array
    {
        return [
            'live_key' => static::get('api_key_live'),
            'test_key' => static::get('api_key_test'),
            'live_key_last_used' => static::get('api_key_live_last_used'),
            'test_key_last_used' => static::get('api_key_test_last_used'),
        ];
    }

    public static function getRateLimits(): array
    {
        return [
            'requests_per_minute' => (int) static::get('rate_limit_per_minute', 60),
            'requests_per_day' => (int) static::get('rate_limit_per_day', 10000),
        ];
    }

    public static function isMaintenanceMode(): bool
    {
        return static::get('maintenance_mode', 'false') === 'true';
    }
}
