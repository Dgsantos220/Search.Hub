<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'actor_user_id',
        'target_user_id',
        'action',
        'entity_type',
        'entity_id',
        'payload',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'payload' => 'array',
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public static function log(
        string $action,
        ?int $actorId = null,
        ?int $targetId = null,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $payload = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        return self::create([
            'actor_user_id' => $actorId ?? auth()->id(),
            'target_user_id' => $targetId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload' => $payload,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
