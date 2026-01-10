<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ConsultaHistory;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\GatewaySetting;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AdminPageController extends Controller
{
    public function dashboard(): Response
    {
        $totalUsers = User::count();
        $activeUsers = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $todayConsultas = ConsultaHistory::whereDate('created_at', Carbon::today())->count();
        $monthConsultas = ConsultaHistory::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        
        $consultasPorMes = ConsultaHistory::where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get()
            ->groupBy(fn($item) => $item->created_at->format('Y-m'))
            ->map(fn($items, $month) => ['month' => $month, 'total' => $items->count()])
            ->values()
            ->toArray();

        $recentActivity = ConsultaHistory::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'user' => $item->user?->name ?? 'Desconhecido',
                'tipo' => $item->tipo,
                'query' => substr($item->query, 0, 20) . '...',
                'created_at' => $item->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'active_last_30_days' => $activeUsers,
                ],
                'consultas' => [
                    'today' => $todayConsultas,
                    'this_month' => $monthConsultas,
                ],
                'charts' => [
                    'monthly' => $consultasPorMes,
                ],
                'recent_activity' => $recentActivity,
            ],
        ]);
    }

    public function users(Request $request): Response
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        
        $query = User::with('roles')
            ->withCount(['consultaHistories as consultas_count'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage)->through(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name'),
            'consultas_count' => $user->consultas_count,
            'created_at' => $user->created_at->format('d/m/Y'),
            'last_login' => $user->updated_at->diffForHumans(),
            'status' => 'Ativo',
        ]);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function updateUser(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'status' => 'sometimes|string|in:Ativo,Bloqueado,Pendente',
        ]);

        $user->update($validated);

        return back()->with('success', 'Usuário atualizado com sucesso.');
    }

    public function deleteUser(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        
        if ($user->hasRole('admin')) {
            return back()->with('error', 'Não é possível excluir um administrador.');
        }

        $user->delete();

        return back()->with('success', 'Usuário excluído com sucesso.');
    }

    public function system(): Response
    {
        $dbDriver = config('database.default');
        $dbSize = 0;

        try {
            if ($dbDriver === 'pgsql') {
                $dbName = config('database.connections.pgsql.database');
                $result = DB::select("SELECT pg_database_size(?) as size", [$dbName]);
                $dbSize = $result[0]->size ?? 0;
            } elseif ($dbDriver === 'mysql') {
                $dbName = config('database.connections.mysql.database');
                $result = DB::select("SELECT sum(data_length + index_length) as size 
                                    FROM information_schema.TABLES 
                                    WHERE table_schema = ?", [$dbName]);
                $dbSize = $result[0]->size ?? 0;
            }
        } catch (\Exception $e) {
            $dbSize = 0;
        }

        $apiKeys = SystemSetting::getApiKeys();
        $rateLimits = SystemSetting::getRateLimits();
        $maintenanceMode = SystemSetting::isMaintenanceMode();

        $liveKeyMasked = $apiKeys['live_key'] 
            ? substr($apiKeys['live_key'], 0, 10) . '...' . substr($apiKeys['live_key'], -6) 
            : null;
        $testKeyMasked = $apiKeys['test_key'] 
            ? substr($apiKeys['test_key'], 0, 10) . '...' . substr($apiKeys['test_key'], -6) 
            : null;
        
        return Inertia::render('Admin/System', [
            'systemStats' => [
                'database' => [
                    'driver' => $dbDriver,
                    'size_bytes' => $dbSize,
                    'size_formatted' => $this->formatBytes($dbSize),
                ],
                'server' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'memory_usage' => $this->formatBytes(memory_get_usage(true)),
                    'uptime' => 'N/A',
                ],
                'cache' => [
                    'driver' => config('cache.default'),
                    'status' => 'Operacional',
                ],
                'mail' => [
                    'driver' => SystemSetting::get('MAIL_MAILER', config('mail.default')),
                    'host' => SystemSetting::get('MAIL_HOST', config('mail.mailers.smtp.host')),
                    'port' => SystemSetting::get('MAIL_PORT', config('mail.mailers.smtp.port')),
                    'username' => SystemSetting::get('MAIL_USERNAME', config('mail.mailers.smtp.username')),
                    'encryption' => SystemSetting::get('MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption')),
                    'from_address' => SystemSetting::get('MAIL_FROM_ADDRESS', config('mail.from.address')),
                    'from_name' => SystemSetting::get('MAIL_FROM_NAME', config('mail.from.name')),
                ],
            ],
            'apiKeys' => [
                'live_key' => $apiKeys['live_key'],
                'live_key_masked' => $liveKeyMasked,
                'test_key' => $apiKeys['test_key'],
                'test_key_masked' => $testKeyMasked,
                'has_live_key' => !empty($apiKeys['live_key']),
                'has_test_key' => !empty($apiKeys['test_key']),
                'live_key_last_used' => $apiKeys['live_key_last_used'],
                'test_key_last_used' => $apiKeys['test_key_last_used'],
            ],
            'rateLimits' => $rateLimits,
            'maintenanceMode' => $maintenanceMode,
        ]);
    }

    public function rotateApiKeys(Request $request): RedirectResponse
    {
        $type = $request->input('type', 'both');

        if ($type === 'live' || $type === 'both') {
            $newLiveKey = SystemSetting::generateApiKey('sk_live');
            SystemSetting::set('api_key_live', $newLiveKey);
        }

        if ($type === 'test' || $type === 'both') {
            $newTestKey = SystemSetting::generateApiKey('sk_test');
            SystemSetting::set('api_key_test', $newTestKey);
        }

        return back()->with('success', 'Chaves de API rotacionadas com sucesso.');
    }

    public function updateRateLimits(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'requests_per_minute' => 'required|integer|min:1|max:1000',
            'requests_per_day' => 'required|integer|min:1|max:1000000',
        ]);

        SystemSetting::set('rate_limit_per_minute', (string) $validated['requests_per_minute']);
        SystemSetting::set('rate_limit_per_day', (string) $validated['requests_per_day']);

        return back()->with('success', 'Limites de taxa atualizados.');
    }

    public function updateMailSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mail_host' => 'required|string',
            'mail_port' => 'required|numeric',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string',
        ]);

        SystemSetting::set('MAIL_MAILER', 'smtp');
        SystemSetting::set('MAIL_HOST', $validated['mail_host']);
        SystemSetting::set('MAIL_PORT', (string)$validated['mail_port']);
        SystemSetting::set('MAIL_USERNAME', $validated['mail_username']);
        
        if (!empty($validated['mail_password'])) {
            SystemSetting::set('MAIL_PASSWORD', $validated['mail_password']);
        }
        
        SystemSetting::set('MAIL_ENCRYPTION', $validated['mail_encryption']);
        SystemSetting::set('MAIL_FROM_ADDRESS', $validated['mail_from_address']);
        SystemSetting::set('MAIL_FROM_NAME', $validated['mail_from_name']);

        return back()->with('success', 'Configurações de e-mail atualizadas com sucesso.');
    }

    public function sendTestEmail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            \Illuminate\Support\Facades\Mail::raw('Este e um e-mail de teste para verificar as configurações SMTP do sistema ' . config('app.name'), function ($message) use ($validated) {
                $message->to($validated['email'])
                    ->subject('Teste de Configuração de E-mail - ' . config('app.name'));
            });

            return back()->with('success', 'E-mail de teste enviado com sucesso para ' . $validated['email']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erro ao enviar email de teste: ' . $e->getMessage());
            return back()->with('error', 'Falha ao enviar e-mail: ' . $e->getMessage());
        }
    }

    public function toggleMaintenanceMode(): RedirectResponse
    {
        $current = SystemSetting::isMaintenanceMode();
        SystemSetting::set('maintenance_mode', $current ? 'false' : 'true');

        $status = $current ? 'desativado' : 'ativado';
        return back()->with('success', "Modo de manutenção {$status}.");
    }

    public function clearCache(): RedirectResponse
    {
        \Artisan::call('cache:clear');
        \Artisan::call('config:clear');
        \Artisan::call('view:clear');

        return back()->with('success', 'Cache do sistema limpo com sucesso.');
    }

    public function plans(): Response
    {
        $plans = Plan::withTrashed()
            ->withCount('subscriptions')
            ->orderBy('price_cents')
            ->get()
            ->map(fn($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'interval' => $plan->interval,
                'features' => $plan->features ?? [],
                'is_active' => $plan->is_active,
                'subscriptions_count' => $plan->subscriptions_count,
                'deleted_at' => $plan->deleted_at,
                'created_at' => $plan->created_at->format('d/m/Y'),
            ]);

        return Inertia::render('Admin/Plans', [
            'plans' => $plans,
        ]);
    }

    public function storePlan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'interval' => 'required|in:monthly,yearly,one_time',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'trial_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (Plan::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        Plan::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'price_cents' => (int) round(($validated['price'] ?? 0) * 100),
            'interval' => $validated['interval'],
            'features' => $validated['features'] ?? [],
            'limits' => $validated['limits'] ?? ['consultas_por_mes' => 100, 'consultas_por_dia' => 10],
            'trial_days' => $validated['trial_days'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Plano criado com sucesso.');
    }

    public function updatePlan(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'interval' => 'sometimes|in:monthly,yearly,one_time',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'trial_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $updateData = [];
        
        if (isset($validated['name'])) {
            $updateData['name'] = $validated['name'];
            if ($plan->name !== $validated['name']) {
                $slug = \Illuminate\Support\Str::slug($validated['name']);
                $originalSlug = $slug;
                $counter = 1;
                while (Plan::withTrashed()->where('slug', $slug)->where('id', '!=', $plan->id)->exists()) {
                    $slug = $originalSlug . '-' . $counter++;
                }
                $updateData['slug'] = $slug;
            }
        }
        
        if (isset($validated['description'])) {
            $updateData['description'] = $validated['description'];
        }
        
        if (isset($validated['price'])) {
            $updateData['price_cents'] = (int) round($validated['price'] * 100);
        }
        
        if (isset($validated['interval'])) {
            $updateData['interval'] = $validated['interval'];
        }
        
        if (array_key_exists('features', $validated)) {
            $updateData['features'] = $validated['features'] ?? [];
        }
        
        if (array_key_exists('limits', $validated)) {
            $updateData['limits'] = $validated['limits'];
        }
        
        if (array_key_exists('trial_days', $validated)) {
            $updateData['trial_days'] = $validated['trial_days'];
        }
        
        if (isset($validated['is_active'])) {
            $updateData['is_active'] = $validated['is_active'];
        }

        $plan->update($updateData);

        return back()->with('success', 'Plano atualizado com sucesso.');
    }

    public function deletePlan(Plan $plan): RedirectResponse
    {
        $plan->delete();

        return back()->with('success', 'Plano excluído com sucesso.');
    }

    public function togglePlanActive(Plan $plan): RedirectResponse
    {
        $plan->update(['is_active' => !$plan->is_active]);

        return back()->with('success', 'Status do plano alterado.');
    }

    public function duplicatePlan(Plan $plan): RedirectResponse
    {
        $newPlan = $plan->replicate();
        $newPlan->name = $plan->name . ' (Cópia)';
        
        $slug = \Illuminate\Support\Str::slug($newPlan->name);
        $originalSlug = $slug;
        $counter = 1;
        while (Plan::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }
        $newPlan->slug = $slug;
        $newPlan->save();

        return back()->with('success', 'Plano duplicado com sucesso.');
    }

    public function restorePlan(int $id): RedirectResponse
    {
        $plan = Plan::withTrashed()->findOrFail($id);
        $plan->restore();

        return back()->with('success', 'Plano restaurado com sucesso.');
    }

    public function subscriptions(Request $request): Response
    {
        $status = $request->input('status');
        $planId = $request->input('plan_id');
        $search = $request->input('search');

        $subscriptionsQuery = Subscription::with(['user:id,name,email', 'plan:id,name,price_cents'])
            ->orderBy('created_at', 'desc');

        if ($status) {
            $subscriptionsQuery->where('status', $status);
        }
        if ($planId) {
            $subscriptionsQuery->where('plan_id', $planId);
        }
        if ($search) {
            $subscriptionsQuery->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $subscriptions = $subscriptionsQuery->paginate(10)->through(fn($sub) => [
            'id' => $sub->id,
            'user' => $sub->user ? ['id' => $sub->user->id, 'name' => $sub->user->name, 'email' => $sub->user->email] : null,
            'plan' => $sub->plan ? ['id' => $sub->plan->id, 'name' => $sub->plan->name, 'price' => $sub->plan->price] : null,
            'status' => $sub->status,
            'current_period_start' => $sub->current_period_start?->format('d/m/Y'),
            'current_period_end' => $sub->current_period_end?->format('d/m/Y'),
            'cancel_at_period_end' => $sub->cancel_at_period_end,
            'created_at' => $sub->created_at->format('d/m/Y'),
        ]);

        $paymentsQuery = Payment::with(['user:id,name,email', 'subscription.plan:id,name'])
            ->orderBy('created_at', 'desc');

        $paymentStatus = $request->input('payment_status');
        if ($paymentStatus) {
            $paymentsQuery->where('status', $paymentStatus);
        }

        $payments = $paymentsQuery->paginate(10, ['*'], 'payments_page')->through(fn($payment) => [
            'id' => $payment->id,
            'user' => $payment->user ? ['id' => $payment->user->id, 'name' => $payment->user->name, 'email' => $payment->user->email] : null,
            'plan_name' => $payment->subscription?->plan?->name ?? 'N/A',
            'amount' => $payment->amount,
            'status' => $payment->status,
            'payment_method' => $payment->payment_method,
            'created_at' => $payment->created_at->format('d/m/Y H:i'),
        ]);

        $activeCount = Subscription::where('status', 'active')->count();
        $trialingCount = Subscription::where('status', 'trialing')->count();
        $monthlyRevenue = Payment::where('status', 'paid')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount_cents') / 100;
        $canceledThisMonth = Subscription::where('status', 'canceled')
            ->whereMonth('updated_at', Carbon::now()->month)
            ->count();
        $totalActiveStart = Subscription::whereIn('status', ['active', 'canceled'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();
        $churnRate = $totalActiveStart > 0 ? round(($canceledThisMonth / $totalActiveStart) * 100, 1) : 0;

        $plans = Plan::select('id', 'name')->where('is_active', true)->get();

        return Inertia::render('Admin/Subscriptions', [
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'stats' => [
                'active_count' => $activeCount,
                'trialing_count' => $trialingCount,
                'monthly_revenue' => $monthlyRevenue,
                'churn_rate' => $churnRate,
            ],
            'plans' => $plans,
            'filters' => [
                'status' => $status,
                'plan_id' => $planId,
                'search' => $search,
                'payment_status' => $paymentStatus,
            ],
        ]);
    }

    public function cancelSubscription(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status' => 'canceled',
            'cancel_at_period_end' => true,
        ]);

        return back()->with('success', 'Assinatura cancelada com sucesso.');
    }

    public function reactivateSubscription(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status' => 'active',
            'cancel_at_period_end' => false,
        ]);

        return back()->with('success', 'Assinatura reativada com sucesso.');
    }

    public function approvePayment(Payment $payment): RedirectResponse
    {
        $payment->update(['status' => 'paid']);

        if ($payment->subscription) {
            $payment->subscription->update(['status' => 'active']);
        }

        return back()->with('success', 'Pagamento aprovado com sucesso.');
    }

    public function rejectPayment(Request $request, Payment $payment): RedirectResponse
    {
        $payment->update([
            'status' => 'failed',
            'notes' => $request->input('reason'),
        ]);

        return back()->with('success', 'Pagamento rejeitado.');
    }

    public function gateways(): Response
    {
        $gateways = [];
        $providers = ['stripe', 'mercadopago'];

        foreach ($providers as $provider) {
            $setting = GatewaySetting::where('provider', $provider)->first();
            $gateways[$provider] = [
                'enabled' => $setting?->enabled ?? false,
                'sandbox_mode' => $setting?->sandbox_mode ?? true,
                'has_credentials' => $setting ? $setting->hasCredentials() : false,
                'webhook_url' => url("/api/webhooks/{$provider}"),
                'last_tested_at' => $setting?->last_tested_at?->format('d/m/Y H:i'),
                'test_status' => $setting?->test_status,
            ];
        }

        return Inertia::render('Admin/Gateways', [
            'gateways' => $gateways,
        ]);
    }

    public function updateGateway(Request $request, string $provider): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => 'sometimes|boolean',
            'sandbox_mode' => 'sometimes|boolean',
            'public_key' => 'sometimes|nullable|string',
            'secret_key' => 'sometimes|nullable|string',
            'access_token' => 'sometimes|nullable|string',
            'webhook_secret' => 'sometimes|nullable|string',
        ]);

        $setting = GatewaySetting::firstOrCreate(
            ['provider' => $provider],
            ['enabled' => false, 'sandbox_mode' => true]
        );

        $updateData = [];
        
        if (isset($validated['enabled'])) {
            $updateData['enabled'] = $validated['enabled'];
        }
        if (isset($validated['sandbox_mode'])) {
            $updateData['sandbox_mode'] = $validated['sandbox_mode'];
        }
        if (!empty($validated['public_key'])) {
            $updateData['public_key'] = $validated['public_key'];
        }
        if (!empty($validated['secret_key'])) {
            $updateData['secret_key'] = $validated['secret_key'];
        }
        if (!empty($validated['access_token'])) {
            $updateData['access_token'] = $validated['access_token'];
        }
        if (!empty($validated['webhook_secret'])) {
            $updateData['webhook_secret'] = $validated['webhook_secret'];
        }

        $setting->update($updateData);

        return back()->with('success', 'Configurações do gateway atualizadas.');
    }

    public function testGateway(string $provider): RedirectResponse
    {
        $setting = GatewaySetting::where('provider', $provider)->first();

        if (!$setting || !$setting->hasCredentials()) {
            return back()->with('error', 'Configure as credenciais antes de testar.');
        }

        $billingService = app(\App\Services\Billing\BillingService::class);
        $result = $billingService->testConnection($provider);

        $setting->update([
            'last_tested_at' => now(),
            'test_status' => $result['success'] ? 'success' : 'failed',
        ]);

        if ($result['success']) {
            $message = $result['message'] ?? 'Conexão testada com sucesso.';
            if (isset($result['mode'])) {
                $message .= ' (Modo: ' . $result['mode'] . ')';
            }
            return back()->with('success', $message);
        }

        return back()->with('error', $result['error'] ?? 'Falha na conexão.');
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
