<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SystemSetting;

class CheckSystemMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        // Se o modo de manutenção estiver ativo
        if (SystemSetting::isMaintenanceMode()) {
            
            // Permitir que Administradores continuem usando
            if ($request->user() && $request->user()->hasRole('admin')) {
                return $next($request);
            }

            // Para API
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'O sistema está em manutenção temporária. Tente novamente em alguns instantes.'
                ], 503);
            }
            
            // Para Web (Redirecionar ou mostrar erro)
            abort(503, 'Sistema em Manutenção');
        }

        return $next($request);
    }
}
