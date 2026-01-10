<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiRateLimiter
{
    protected RateLimiter $limiter;
    protected int $maxAttempts = 60;
    protected int $decayMinutes = 1;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Carregar limites dinâmicos do banco
        $limits = \App\Models\SystemSetting::getRateLimits();
        $this->maxAttempts = (int) ($limits['requests_per_minute'] ?? 60);

        $key = $this->resolveRequestSignature($request);
        
        if ($this->limiter->tooManyAttempts($key, $this->maxAttempts)) {
            $retryAfter = $this->limiter->availableIn($key);
            
            return response()->json([
                'success' => false,
                'message' => 'Limite de requisições excedido. Tente novamente em ' . $retryAfter . ' segundos.',
                'retry_after' => $retryAfter,
            ], 429)->withHeaders([
                'Retry-After' => $retryAfter,
                'X-RateLimit-Limit' => $this->maxAttempts,
                'X-RateLimit-Remaining' => 0,
            ]);
        }
        
        $this->limiter->hit($key, $this->decayMinutes * 60);
        
        $response = $next($request);
        
        return $response->withHeaders([
            'X-RateLimit-Limit' => $this->maxAttempts,
            'X-RateLimit-Remaining' => $this->limiter->remaining($key, $this->maxAttempts),
        ]);
    }

    protected function resolveRequestSignature(Request $request): string
    {
        $userId = $request->user()?->id ?? 'guest';
        return 'api_rate_limit:' . $userId . ':' . $request->ip();
    }
}
