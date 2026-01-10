<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware EnsureRole
 * 
 * Garante que o usuário autenticado possui uma role específica
 * 
 * @package App\Http\Middleware
 */
class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     * @param string ...$roles Roles necessárias (aceita múltiplas)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Não autenticado.',
                ], 401);
            }
            return redirect()->route('login');
        }

        if (!$request->user()->hasAnyRole($roles)) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Acesso negado. Você não possui permissão para acessar este recurso.',
                    'required_roles' => $roles,
                ], 403);
            }
            abort(403, 'Acesso negado. Você não possui permissão para acessar este recurso.');
        }

        return $next($request);
    }
}
