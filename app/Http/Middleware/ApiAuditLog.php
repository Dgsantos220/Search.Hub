<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiAuditLog
{
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $duration = round((microtime(true) - $startTime) * 1000, 2);
        
        $logData = [
            'timestamp' => now()->toIso8601String(),
            'ip' => $request->ip(),
            'user_id' => $request->user()?->id,
            'method' => $request->method(),
            'path' => $request->path(),
            'query' => $this->sanitizeQuery($request->query()),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'user_agent' => $request->userAgent(),
        ];
        
        Log::channel('api_audit')->info('API Request', $logData);
        
        return $response;
    }

    protected function sanitizeQuery(array $query): array
    {
        $sensitiveFields = ['password', 'token', 'secret', 'key'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($query[$field])) {
                $query[$field] = '***REDACTED***';
            }
        }
        
        return $query;
    }
}
