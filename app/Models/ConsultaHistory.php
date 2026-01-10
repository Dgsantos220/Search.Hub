<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsultaHistory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'tipo',
        'query',
        'success',
        'resultado_resumo',
    ];

    protected $casts = [
        'success' => 'boolean',
        'resultado_resumo' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
    }

    public function scopeWithCursor($query, ?string $cursor = null)
    {
        if ($cursor) {
            try {
                $decoded = json_decode(base64_decode($cursor), true);
                if ($decoded && isset($decoded['ts']) && isset($decoded['id'])) {
                    $timestamp = Carbon::createFromFormat('Y-m-d H:i:s', $decoded['ts']);
                    if (!$timestamp) {
                        return $query;
                    }
                    $formattedTs = $timestamp->format('Y-m-d H:i:s');
                    return $query->where(function ($q) use ($formattedTs, $decoded) {
                        $q->where('created_at', '<', $formattedTs)
                          ->orWhere(function ($q2) use ($formattedTs, $decoded) {
                              $q2->where('created_at', '=', $formattedTs)
                                 ->where('id', '<', $decoded['id']);
                          });
                    });
                }
            } catch (\Exception $e) {
                return $query;
            }
        }
        return $query;
    }

    public static function encodeCursor($createdAt, $id): string
    {
        return base64_encode(json_encode(['ts' => $createdAt, 'id' => $id]));
    }

    public static function decodeCursor(?string $cursor): ?array
    {
        if (!$cursor) return null;
        $decoded = json_decode(base64_decode($cursor), true);
        return is_array($decoded) ? $decoded : null;
    }
}
