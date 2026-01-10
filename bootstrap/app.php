<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(prepend: [
            \App\Http\Middleware\TrustProxies::class,
        ]);
        
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\CheckSystemMaintenance::class,
            \App\Http\Middleware\ApiRateLimiter::class,
            \App\Http\Middleware\ApiAuditLog::class,
        ]);

        $middleware->alias([
            'maintenance' => \App\Http\Middleware\CheckSystemMaintenance::class,
            'role' => \App\Http\Middleware\EnsureRole::class,
            'subscription.active' => \App\Http\Middleware\EnsureSubscriptionActive::class,
            'record.usage' => \App\Http\Middleware\RecordUsage::class,
            'auth.apikey' => \App\Http\Middleware\AuthenticateApiKey::class,
            'turnstile' => \App\Http\Middleware\VerifyTurnstile::class,
        ]);

        $middleware->redirectUsersTo(function () {
            $user = \Illuminate\Support\Facades\Auth::user();
            
            if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
                return route('admin.dashboard');
            }

            return route('dashboard');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
