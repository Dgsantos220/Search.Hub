<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifyTurnstile
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Permitir ambiente local sem segredo configurado
        if (app()->environment('local') && !config('services.turnstile.secret')) {
             return $next($request);
        }

        // 2. Permitir acesso via API Key ou Bearer Token (não navegador)
        if ($request->bearerToken()) {
            return $next($request);
        }

        $token = $request->header('X-Turnstile-Token') ?? $request->input('turnstile_token');

        if (!$token) {
            $msg = 'Validação de segurança não encontrada. Atualize a página.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 403);
            }
            return back()->withErrors(['turnstile' => $msg])->withInput();
        }

        try {
            $http = Http::asForm();
            
            $secret = trim(config('services.turnstile.secret'));

            // MODO DE DESBLOQUEIO: Se estiver usando a chave de teste oficial, aprovar automaticamente
            // Isso permite que você trabalhe localmente mesmo se a conexão com Cloudflare falhar
            if ($secret === '1x00000000000000000000AA') {
                return $next($request);
            }

            // Ignorar verificação SSL no ambiente local (Correção XAMPP)
            if (app()->environment('local')) {
                $http->withoutVerifying();
            }

            $response = $http->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => trim(config('services.turnstile.secret')),
                'response' => $token,
            ]);

            $data = $response->json();

            if (!($data['success'] ?? false)) {
                $msg = 'Falha na verificação de segurança. Tente novamente.';
                
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $msg,
                        'errors' => $data['error-codes'] ?? [],
                    ], 403);
                }
                
                return back()->withErrors(['turnstile' => $msg])->withInput();
            }

        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Erro interno de validação.'], 500);
            }
            return back()->withErrors(['turnstile' => 'Erro de conexão com serviço de segurança.'])->withInput();
        }

        return $next($request);
    }
}
