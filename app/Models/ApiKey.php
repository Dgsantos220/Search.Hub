<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class ApiKey extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'key',
        'active',
        'last_used_at',
    ];

    protected $casts = [
        'active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    /**
     * Gera uma nova chave de API, retornando a instância com a chave em texto puro
     * apenas no momento da criação para exibição ao usuário.
     */
    public static function generate(int $userId, string $name): array
    {
        $plainKey = 'm7_' . Str::random(40);
        
        $apiKey = self::create([
            'user_id' => $userId,
            'name' => $name,
            'key' => hash('sha256', $plainKey),
            'active' => true,
        ]);

        return [
            'model' => $apiKey,
            'plainTextKey' => $plainKey
        ];
    }

    /**
     * Verifica se uma chave em texto puro corresponde ao hash no banco.
     */
    public static function findByKey(string $plainKey): ?self
    {
        return self::where('key', hash('sha256', $plainKey))
            ->where('active', true)
            ->first();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
