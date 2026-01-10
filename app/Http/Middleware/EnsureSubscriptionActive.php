<?php

namespace App\Http\Middleware;

use App\Services\UsageService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionActive
{
    protected UsageService $usageService;

    public function __construct(UsageService $usageService)
    {
        $this->usageService = $usageService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'UNAUTHENTICATED',
                    'message' => 'Não autenticado.',
                ], 401);
            }
            return redirect()->route('login');
        }

        if ($request->user()->hasRole('admin')) {
            return $next($request);
        }

        $check = $this->usageService->canPerformConsulta($request->user());

        if (!$check['allowed']) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => $check['error'],
                    'message' => $check['message'],
                    'usage' => $check['usage'] ?? null,
                ], 403);
            }
            
            return redirect()->route('plans')
                ->with('error', $check['message']);
        }

        return $next($request);
    }
}
