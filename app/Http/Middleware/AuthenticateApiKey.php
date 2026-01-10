<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ApiKey;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Se já estiver autenticado via sessão (web), permitir a consulta
        if (auth()->guard('web')->check()) {
            return $next($request);
        }

        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Chave de API ausente no cabeçalho Authorization.'
            ], 401);
        }

        $apiKey = ApiKey::findByKey($token);

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Chave de API inválida ou bloqueada.'
            ], 401);
        }

        // Vincular o usuário da chave à requisição
        $request->setUserResolver(function () use ($apiKey) {
            return $apiKey->user;
        });

        // Atualizar último uso
        $apiKey->update(['last_used_at' => now()]);

        return $next($request);
    }
}
