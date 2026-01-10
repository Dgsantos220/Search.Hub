<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Payment Status Enum
 * 
 * Representa os possíveis estados de um pagamento no sistema
 */
enum PaymentStatus: string
{
    /**
     * Aguardando pagamento
     */
    case PENDING = 'pending';
    
    /**
     * Aprovado
     */
    case APPROVED = 'approved';
    
    /**
     * Em processamento
     */
    case IN_PROCESS = 'in_process';
    
    /**
     * Rejeitado
     */
    case REJECTED = 'rejected';
    
    /**
     * Cancelado
     */
    case CANCELLED = 'cancelled';
    
    /**
     * Reembolsado
     */
    case REFUNDED = 'refunded';
    
    /**
     * Chargeback
     */
    case CHARGED_BACK = 'charged_back';

    /**
     * Verifica se o pagamento foi bem-sucedido
     */
    public function isSuccessful(): bool
    {
        return $this === self::APPROVED;
    }

    /**
     * Verifica se o pagamento falhou
     */
    public function isFailed(): bool
    {
        return in_array($this, [
            self::REJECTED,
            self::CANCELLED,
            self::CHARGED_BACK,
        ], true);
    }

    /**
     * Verifica se o pagamento pode ser reembolsado
     */
    public function canBeRefunded(): bool
    {
        return $this === self::APPROVED;
    }

    /**
     * Retorna o label de exibição do status
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Aguardando',
            self::APPROVED => 'Aprovado',
            self::IN_PROCESS => 'Em Processamento',
            self::REJECTED => 'Rejeitado',
            self::CANCELLED => 'Cancelado',
            self::REFUNDED => 'Reembolsado',
            self::CHARGED_BACK => 'Chargeback',
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
