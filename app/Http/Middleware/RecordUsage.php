<?php

namespace App\Http\Middleware;

use App\Services\UsageService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordUsage
{
    protected UsageService $usageService;

    public function __construct(UsageService $usageService)
    {
        $this->usageService = $usageService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response->isSuccessful() && $request->user()) {
            $this->usageService->recordUsage($request->user());
        }

        return $response;
    }
}
