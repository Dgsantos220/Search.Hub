<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Download Status Enum
 * 
 * Representa os possíveis estados de um download no sistema
 */
enum DownloadStatus: string
{
    /**
     * Aguardando download
     */
    case PENDING = 'pending';
    
    /**
     * Download em andamento
     */
    case IN_PROGRESS = 'in_progress';
    
    /**
     * Concluído
     */
    case COMPLETED = 'completed';
    
    /**
     * Falhou
     */
    case FAILED = 'failed';
    
    /**
     * Link expirado
     */
    case EXPIRED = 'expired';

    /**
     * Verifica se o download está disponível
     */
    public function isAvailable(): bool
    {
        return in_array($this, [self::PENDING, self::IN_PROGRESS], true);
    }

    /**
     * Verifica se o download foi finalizado
     */
    public function isFinished(): bool
    {
        return in_array($this, [self::COMPLETED, self::FAILED, self::EXPIRED], true);
    }

    /**
     * Retorna o label de exibição do status
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Aguardando',
            self::IN_PROGRESS => 'Em Andamento',
            self::COMPLETED => 'Concluído',
            self::FAILED => 'Falhou',
            self::EXPIRED => 'Expirado',
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
