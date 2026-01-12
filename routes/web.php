<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\AdminPageController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (\Illuminate\Support\Facades\Auth::check()) {
        $user = \Illuminate\Support\Facades\Auth::user();
        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('dashboard');
    }
    return Inertia::render('Landing');
});

Route::get('/terms', function () {
    return Inertia::render('Terms');
});

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/consulta/{query}', function ($query, \Illuminate\Http\Request $request) {
    return Inertia::render('Consulta', [
        'query' => $query,
        'module' => $request->query('module', 'cpf'),
        'token' => $request->query('token'), // Token do Turnstile vindo do Dashboard
    ]);
})->middleware(['auth', 'verified', 'subscription.active'])->name('consulta');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/history', [PageController::class, 'history'])->name('history');
    Route::post('/history', [PageController::class, 'storeHistory'])->name('history.store');
    Route::delete('/history/{id}', [PageController::class, 'deleteHistory'])->name('history.delete');
    Route::delete('/history', [PageController::class, 'clearHistory'])->name('history.clear');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('/settings/preferences', [SettingsController::class, 'updatePreferences'])->name('settings.preferences');
    Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications'])->name('settings.notifications');
    Route::put('/settings/security', [SettingsController::class, 'updateSecurity'])->name('settings.security');
    Route::post('/settings/two-factor', [SettingsController::class, 'toggleTwoFactor'])->name('settings.two-factor');

    Route::get('/profile', [PageController::class, 'profile'])->name('profile');
    Route::put('/profile', [PageController::class, 'updateProfile'])->name('profile.update');

    Route::get('/plans', [PageController::class, 'plans'])->name('plans');

    Route::get('/subscription', [PageController::class, 'subscription'])->name('subscription');
    Route::post('/subscription/cancel', [PageController::class, 'cancelSubscription'])->name('subscription.cancel');
    Route::post('/subscription/checkout', [PageController::class, 'checkout'])->name('subscription.checkout');
    
    // Push Notifications
    Route::post('/push/subscribe', [\App\Http\Controllers\PushNotificationController::class, 'store'])->name('push.subscribe');
    Route::post('/push/unsubscribe', [\App\Http\Controllers\PushNotificationController::class, 'destroy'])->name('push.unsubscribe');
});


Route::middleware(['auth', 'verified', 'role:admin,support'])->prefix('admin')->group(function () {
    Route::get('/', [AdminPageController::class, 'dashboard'])->name('admin.dashboard');
    
    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/create', [AdminUserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('admin.users.show');
    Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('admin.users.edit');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/users/{id}/restore', [AdminUserController::class, 'restore'])->name('admin.users.restore');
    Route::delete('/users/{id}/force', [AdminUserController::class, 'forceDelete'])->name('admin.users.force-delete');
    Route::post('/users/{user}/block', [AdminUserController::class, 'block'])->name('admin.users.block');
    Route::post('/users/{user}/unblock', [AdminUserController::class, 'unblock'])->name('admin.users.unblock');
    Route::post('/users/{user}/verify', [AdminUserController::class, 'verify'])->name('admin.users.verify');
    Route::post('/users/{user}/change-plan', [AdminUserController::class, 'changePlan'])->name('admin.users.change-plan');
    Route::post('/users/{user}/cancel-subscription', [AdminUserController::class, 'cancelSubscription'])->name('admin.users.cancel-subscription');
    Route::post('/users/{user}/reactivate-subscription', [AdminUserController::class, 'reactivateSubscription'])->name('admin.users.reactivate-subscription');
    Route::post('/users/{user}/reset-usage', [AdminUserController::class, 'resetUsage'])->name('admin.users.reset-usage');
    Route::post('/users/{user}/adjust-period', [AdminUserController::class, 'adjustPeriod'])->name('admin.users.adjust-period');

    Route::get('/plans', [AdminPageController::class, 'plans'])->name('admin.plans');
    Route::post('/plans', [AdminPageController::class, 'storePlan'])->name('admin.plans.store');
    Route::put('/plans/{plan}', [AdminPageController::class, 'updatePlan'])->name('admin.plans.update');
    Route::delete('/plans/{plan}', [AdminPageController::class, 'deletePlan'])->name('admin.plans.delete');
    Route::post('/plans/{plan}/toggle', [AdminPageController::class, 'togglePlanActive'])->name('admin.plans.toggle');
    Route::post('/plans/{plan}/duplicate', [AdminPageController::class, 'duplicatePlan'])->name('admin.plans.duplicate');
    Route::post('/plans/{id}/restore', [AdminPageController::class, 'restorePlan'])->name('admin.plans.restore');

    Route::get('/subscriptions', [AdminPageController::class, 'subscriptions'])->name('admin.subscriptions');
    Route::post('/subscriptions/{subscription}/cancel', [AdminPageController::class, 'cancelSubscription'])->name('admin.subscriptions.cancel');
    Route::post('/subscriptions/{subscription}/reactivate', [AdminPageController::class, 'reactivateSubscription'])->name('admin.subscriptions.reactivate');
    Route::post('/payments/{payment}/approve', [AdminPageController::class, 'approvePayment'])->name('admin.payments.approve');
    Route::post('/payments/{payment}/reject', [AdminPageController::class, 'rejectPayment'])->name('admin.payments.reject');

    Route::get('/gateways', [AdminPageController::class, 'gateways'])->name('admin.gateways');
    Route::put('/gateways/{provider}', [AdminPageController::class, 'updateGateway'])->name('admin.gateways.update');
    Route::post('/gateways/{provider}/test', [AdminPageController::class, 'testGateway'])->name('admin.gateways.test');

    Route::get('/system', [AdminPageController::class, 'system'])->name('admin.system');
    Route::put('/system/mail', [AdminPageController::class, 'updateMailSettings'])->name('admin.system.mail');
    Route::post('/system/test-email', [AdminPageController::class, 'sendTestEmail'])->name('admin.system.test-email');
    Route::post('/system/rotate-keys', [AdminPageController::class, 'rotateApiKeys'])->name('admin.system.rotate-keys');
    Route::put('/system/rate-limits', [AdminPageController::class, 'updateRateLimits'])->name('admin.system.rate-limits');
    Route::post('/system/maintenance', [AdminPageController::class, 'toggleMaintenanceMode'])->name('admin.system.maintenance');
    Route::post('/system/clear-cache', [AdminPageController::class, 'clearCache'])->name('admin.system.clear-cache');

    Route::get('/api-keys', [\App\Http\Controllers\Admin\ApiKeyController::class, 'index'])->name('admin.api-keys.index');
    Route::get('/api-docs', function () {
        return Inertia::render('Admin/ApiDocs');
    })->name('admin.api-docs');

    Route::get('/api-docs/download', function () {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.api-docs');
        return $pdf->download('M7-Consultas-API-Doc.pdf');
    })->name('admin.api-docs.download');
    Route::post('/api-keys', [\App\Http\Controllers\Admin\ApiKeyController::class, 'store'])->name('admin.api-keys.store');
    Route::post('/api-keys/{id}/toggle', [\App\Http\Controllers\Admin\ApiKeyController::class, 'toggle'])->name('admin.api-keys.toggle');
    Route::delete('/api-keys/{id}', [\App\Http\Controllers\Admin\ApiKeyController::class, 'destroy'])->name('admin.api-keys.destroy');
});

require __DIR__.'/auth.php';
