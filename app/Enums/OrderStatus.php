<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Order Status Enum
 * 
 * Representa os possíveis estados de um pedido no sistema
 */
enum OrderStatus: string
{
    /**
     * Pendente de pagamento
     */
    case PENDING = 'pending';
    
    /**
     * Processando pagamento
     */
    case PROCESSING = 'processing';
    
    /**
     * Completo/Pago
     */
    case COMPLETED = 'completed';
    
    /**
     * Pagamento falhou
     */
    case FAILED = 'failed';
    
    /**
     * Cancelado
     */
    case CANCELLED = 'cancelled';
    
    /**
     * Reembolsado
     */
    case REFUNDED = 'refunded';

    /**
     * Verifica se o pedido está pago
     */
    public function isPaid(): bool
    {
        return $this === self::COMPLETED;
    }

    /**
     * Verifica se o pedido está pendente (aguardando ou processando)
     */
    public function isPending(): bool
    {
        return in_array($this, [self::PENDING, self::PROCESSING], true);
    }

    /**
     * Verifica se o pedido pode ser cancelado
     */
    public function isCancellable(): bool
    {
        return in_array($this, [self::PENDING, self::PROCESSING], true);
    }

    /**
     * Retorna o label de exibição do status
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pendente',
            self::PROCESSING => 'Processando',
            self::COMPLETED => 'Completo',
            self::FAILED => 'Falhou',
            self::CANCELLED => 'Cancelado',
            self::REFUNDED => 'Reembolsado',
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
