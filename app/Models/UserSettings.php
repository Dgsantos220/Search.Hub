<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSettings extends Model
{
    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'timezone',
        'notifications_email',
        'notifications_push',
        'two_factor_enabled',
        'preferences',
    ];

    protected $casts = [
        'notifications_email' => 'boolean',
        'notifications_push' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'preferences' => 'array',
    ];

    protected $attributes = [
        'theme' => 'dark',
        'language' => 'pt-BR',
        'timezone' => 'America/Sao_Paulo',
        'notifications_email' => true,
        'notifications_push' => false,
        'two_factor_enabled' => false,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getOrCreate(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            [
                'theme' => 'dark',
                'language' => 'pt-BR',
                'timezone' => 'America/Sao_Paulo',
            ]
        );
    }

    public static function getThemeOptions(): array
    {
        return [
            'dark' => 'Escuro',
            'light' => 'Claro',
            'system' => 'Sistema',
        ];
    }

    public static function getLanguageOptions(): array
    {
        return [
            'pt-BR' => 'Português (Brasil)',
            'en' => 'English',
            'es' => 'Español',
        ];
    }

    public static function getTimezoneOptions(): array
    {
        return [
            'America/Sao_Paulo' => 'São Paulo (GMT-3)',
            'America/Manaus' => 'Manaus (GMT-4)',
            'America/Belem' => 'Belém (GMT-3)',
            'America/Fortaleza' => 'Fortaleza (GMT-3)',
            'America/Recife' => 'Recife (GMT-3)',
            'America/Cuiaba' => 'Cuiabá (GMT-4)',
            'America/Porto_Velho' => 'Porto Velho (GMT-4)',
            'America/Rio_Branco' => 'Rio Branco (GMT-5)',
        ];
    }
}
