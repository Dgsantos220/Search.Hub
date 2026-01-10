<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Subscription Status Enum
 * 
 * Representa os possíveis estados de uma assinatura no sistema
 */
enum SubscriptionStatus: string
{
    /**
     * Ativa
     */
    case ACTIVE = 'active';
    
    /**
     * Inativa
     */
    case INACTIVE = 'inactive';
    
    /**
     * Pendente ativação
     */
    case PENDING = 'pending';
    
    /**
     * Cancelada
     */
    case CANCELLED = 'cancelled';
    
    /**
     * Expirada
     */
    case EXPIRED = 'expired';
    
    /**
     * Suspensa (pagamento atrasado)
     */
    case SUSPENDED = 'suspended';

    /**
     * Verifica se a assinatura está ativa
     */
    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    /**
     * Verifica se a assinatura permite download
     */
    public function canDownload(): bool
    {
        return $this === self::ACTIVE;
    }

    /**
     * Verifica se a assinatura precisa de renovação
     */
    public function needsRenewal(): bool
    {
        return in_array($this, [self::EXPIRED, self::SUSPENDED], true);
    }

    /**
     * Retorna o label de exibição do status
     */
    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Ativa',
            self::INACTIVE => 'Inativa',
            self::PENDING => 'Pendente',
            self::CANCELLED => 'Cancelada',
            self::EXPIRED => 'Expirada',
            self::SUSPENDED => 'Suspensa',
        };
    }

    /**
     * Retorna todos os casos disponíveis
     * 
     * @return array<self>
     */
    public static function all(): array
    {
        return self::cases();
    }
}
