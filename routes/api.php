<?php

use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ConsultaController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\HistoryController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\UserSubscriptionController;
use App\Http\Controllers\Api\AdminSubscriptionController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\AdminGatewayController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [ApiAuthController::class, 'register'])
        ->name('api.auth.register')
        ->middleware('throttle:10,1');

    Route::post('/login', [ApiAuthController::class, 'login'])
        ->name('api.auth.login')
        ->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [ApiAuthController::class, 'user'])
            ->name('api.auth.user');

        Route::post('/logout', [ApiAuthController::class, 'logout'])
            ->name('api.auth.logout');

        Route::post('/logout-all', [ApiAuthController::class, 'logoutAll'])
            ->name('api.auth.logout-all');

        Route::get('/tokens', [ApiAuthController::class, 'tokens'])
            ->name('api.auth.tokens');

        Route::delete('/tokens/{tokenId}', [ApiAuthController::class, 'revokeToken'])
            ->name('api.auth.tokens.revoke');
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/plans', [PlanController::class, 'index'])->name('api.plans.index');
Route::get('/plans/{plan}', [PlanController::class, 'show'])->name('api.plans.show');

Route::prefix('subscriptions')->middleware(['auth:web'])->group(function () {
    Route::get('/me', [UserSubscriptionController::class, 'me'])->name('api.subscriptions.me');
    Route::post('/checkout', [UserSubscriptionController::class, 'checkout'])->name('api.subscriptions.checkout');
    Route::post('/cancel', [UserSubscriptionController::class, 'cancel'])->name('api.subscriptions.cancel');
    Route::post('/change-plan', [UserSubscriptionController::class, 'changePlan'])->name('api.subscriptions.change-plan');
    Route::post('/reactivate', [UserSubscriptionController::class, 'reactivate'])->name('api.subscriptions.reactivate');
    Route::get('/history', [UserSubscriptionController::class, 'history'])->name('api.subscriptions.history');
    Route::get('/payments', [UserSubscriptionController::class, 'payments'])->name('api.subscriptions.payments');
});

Route::prefix('consulta')->middleware(['auth.apikey', 'subscription.active', 'record.usage', 'turnstile'])->group(function () {
    Route::get('/cpf/{cpf}', [ConsultaController::class, 'consultarCpf'])
        ->name('api.consulta.cpf')
        ->where('cpf', '[0-9.\-]+');

    Route::get('/telefone/{telefone}', [ConsultaController::class, 'consultarTelefone'])
        ->name('api.consulta.telefone')
        ->where('telefone', '[0-9()\-\s]+');

    Route::get('/email/{email}', [ConsultaController::class, 'consultarEmail'])
        ->name('api.consulta.email')
        ->where('email', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}');

    Route::get('/nome', [ConsultaController::class, 'consultarNome'])
        ->name('api.consulta.nome');

    Route::get('/parentes/{cpf}', [ConsultaController::class, 'consultarParentes'])
        ->name('api.consulta.parentes')
        ->where('cpf', '[0-9.\-]+');

    Route::get('/rg/{rg}', [ConsultaController::class, 'consultarRg'])
        ->name('api.consulta.rg')
        ->where('rg', '[0-9.\-]+');
});

Route::prefix('history')->middleware(['auth:web'])->group(function () {
    Route::get('/', [HistoryController::class, 'index'])->name('api.history.index');
    Route::post('/', [HistoryController::class, 'store'])->name('api.history.store');
    Route::delete('/{id}', [HistoryController::class, 'destroy'])->name('api.history.destroy');
    Route::delete('/', [HistoryController::class, 'clear'])->name('api.history.clear');
});

Route::prefix('webhooks')->group(function () {
    Route::post('/manual', [WebhookController::class, 'handleManual'])->name('api.webhooks.manual');
    Route::post('/mercadopago', [WebhookController::class, 'handleMercadoPago'])->name('api.webhooks.mercadopago');
    Route::post('/stripe', [WebhookController::class, 'handleStripe'])->name('api.webhooks.stripe');
});

Route::prefix('admin')->middleware(['auth:web', 'role:admin'])->group(function () {
    Route::get('/stats', [AdminController::class, 'stats'])->name('api.admin.stats');
    
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminController::class, 'users'])->name('api.admin.users');
        Route::put('/{id}', [AdminController::class, 'updateUser'])->name('api.admin.users.update');
        Route::delete('/{id}', [AdminController::class, 'deleteUser'])->name('api.admin.users.delete');
        Route::post('/{id}/verify', [AdminController::class, 'verifyUser'])->name('api.admin.users.verify');
    });

    Route::prefix('system')->group(function () {
        Route::get('/', [AdminController::class, 'systemStats'])->name('api.admin.system');
        Route::put('/rate-limits', [AdminController::class, 'updateRateLimits'])->name('api.admin.system.rate-limits');
        Route::put('/mail', [AdminController::class, 'updateMailSettings'])->name('api.admin.system.mail');
        Route::post('/maintenance', [AdminController::class, 'toggleMaintenanceMode'])->name('api.admin.system.maintenance');
        Route::post('/clear-cache', [AdminController::class, 'clearCache'])->name('api.admin.system.clear-cache');
    });
    
    Route::prefix('plans')->group(function () {
        Route::get('/', [PlanController::class, 'index'])->name('api.admin.plans.index');
        Route::post('/', [PlanController::class, 'store'])->name('api.admin.plans.store');
        Route::get('/{plan}', [PlanController::class, 'show'])->name('api.admin.plans.show');
        Route::put('/{plan}', [PlanController::class, 'update'])->name('api.admin.plans.update');
        Route::delete('/{plan}', [PlanController::class, 'destroy'])->name('api.admin.plans.destroy');
        Route::post('/{plan}/duplicate', [PlanController::class, 'duplicate'])->name('api.admin.plans.duplicate');
        Route::post('/{plan}/toggle-active', [PlanController::class, 'toggleActive'])->name('api.admin.plans.toggle');
        Route::post('/{id}/restore', [PlanController::class, 'restore'])->name('api.admin.plans.restore');
    });
    
    Route::prefix('subscriptions')->group(function () {
        Route::get('/', [AdminSubscriptionController::class, 'index'])->name('api.admin.subscriptions.index');
        Route::get('/stats', [AdminSubscriptionController::class, 'stats'])->name('api.admin.subscriptions.stats');
        Route::get('/payments', [AdminSubscriptionController::class, 'payments'])->name('api.admin.subscriptions.payments');
        Route::post('/create', [AdminSubscriptionController::class, 'createForUser'])->name('api.admin.subscriptions.create');
        Route::get('/{subscription}', [AdminSubscriptionController::class, 'show'])->name('api.admin.subscriptions.show');
        Route::put('/{subscription}', [AdminSubscriptionController::class, 'update'])->name('api.admin.subscriptions.update');
        Route::post('/{subscription}/cancel', [AdminSubscriptionController::class, 'cancel'])->name('api.admin.subscriptions.cancel');
        Route::post('/{subscription}/reactivate', [AdminSubscriptionController::class, 'reactivate'])->name('api.admin.subscriptions.reactivate');
        Route::post('/payments/{payment}/approve', [AdminSubscriptionController::class, 'approvePayment'])->name('api.admin.payments.approve');
        Route::post('/payments/{payment}/reject', [AdminSubscriptionController::class, 'rejectPayment'])->name('api.admin.payments.reject');
    });
    
    Route::prefix('gateways')->group(function () {
        Route::get('/', [AdminGatewayController::class, 'index'])->name('api.admin.gateways.index');
        Route::get('/{provider}', [AdminGatewayController::class, 'show'])->name('api.admin.gateways.show');
        Route::put('/{provider}', [AdminGatewayController::class, 'update'])->name('api.admin.gateways.update');
        Route::post('/{provider}/test', [AdminGatewayController::class, 'test'])->name('api.admin.gateways.test');
        Route::post('/{provider}/toggle', [AdminGatewayController::class, 'toggle'])->name('api.admin.gateways.toggle');
        Route::post('/{provider}/simulate-webhook', [AdminGatewayController::class, 'simulateWebhook'])->name('api.admin.gateways.simulate');
    });
});
