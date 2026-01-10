<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\AuditLog;
use App\Models\Plan;
use App\Models\Role;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $statusFilter = $request->input('status');
        $planFilter = $request->input('plan_id');
        $showDeleted = $request->boolean('show_deleted');

        $query = User::with(['roles', 'activeSubscription.plan'])
            ->withCount(['consultaHistories as consultas_count'])
            ->orderBy('created_at', 'desc');

        if ($showDeleted) {
            $query->withTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->whereHas('roles', fn($q) => $q->where('roles.id', $roleFilter));
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($planFilter && $planFilter !== 'all') {
            $query->whereHas('activeSubscription', fn($q) => $q->where('plan_id', $planFilter));
        }

        $users = $query->paginate($perPage)->through(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'roles' => $user->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name]),
            'subscription' => $user->activeSubscription ? [
                'id' => $user->activeSubscription->id,
                'plan_name' => $user->activeSubscription->plan?->name,
                'status' => $user->activeSubscription->status,
                'current_period_end' => $user->activeSubscription->current_period_end?->format('d/m/Y'),
            ] : null,
            'consultas_count' => $user->consultas_count,
            'created_at' => $user->created_at->format('d/m/Y'),
            'deleted_at' => $user->deleted_at?->format('d/m/Y'),
            'is_verified' => $user->hasVerifiedEmail(),
        ]);

        $roles = Role::all(['id', 'name', 'display_name']);
        $plans = Plan::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => $roles,
            'plans' => $plans,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'status' => $statusFilter,
                'plan_id' => $planFilter,
                'show_deleted' => $showDeleted,
            ],
        ]);
    }

    public function create(): Response
    {
        $roles = Role::all(['id', 'name', 'display_name']);
        $plans = Plan::where('is_active', true)->get()->map(fn($plan) => [
            'id' => $plan->id,
            'name' => $plan->name,
            'price' => $plan->price,
            'interval' => $plan->interval,
            'trial_days' => $plan->trial_days,
        ]);

        return Inertia::render('Admin/UserForm', [
            'roles' => $roles,
            'plans' => $plans,
            'mode' => 'create',
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $password = $validated['password'] ?? Str::random(16);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($password),
                'status' => $validated['status'],
            ]);

            $user->roles()->sync($validated['roles']);

            if ($request->boolean('create_subscription') && !empty($validated['plan_id'])) {
                $plan = Plan::findOrFail($validated['plan_id']);
                $this->subscriptionService->subscribe($user, $plan, 'manual', null, \App\Models\Subscription::STATUS_ACTIVE);
            }

            AuditLog::log(
                'user.created',
                auth()->id(),
                $user->id,
                'User',
                $user->id,
                [
                    'roles' => $validated['roles'],
                    'plan_id' => $validated['plan_id'] ?? null,
                    'send_invite' => $validated['send_invite'] ?? false,
                ]
            );

            return redirect()->route('admin.users.index')
                ->with('success', 'Usuario criado com sucesso.');
        });
    }

    public function show(int $id): Response
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->load(['roles', 'subscriptions.plan', 'auditLogs.actor', 'currentUsage']);

        $plans = Plan::where('is_active', true)->get(['id', 'name', 'price_cents as price', 'interval']);

        return Inertia::render('Admin/UserShow', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name]),
                'created_at' => $user->created_at->format('d/m/Y H:i'),
                'deleted_at' => $user->deleted_at?->format('d/m/Y H:i'),
            ],
            'subscriptions' => $user->subscriptions->map(fn($s) => [
                'id' => $s->id,
                'plan_name' => $s->plan?->name,
                'status' => $s->status,
                'started_at' => $s->started_at?->format('d/m/Y'),
                'current_period_start' => $s->current_period_start?->format('d/m/Y'),
                'current_period_end' => $s->current_period_end?->format('d/m/Y'),
                'canceled_at' => $s->canceled_at?->format('d/m/Y'),
            ]),
            'usage' => $user->currentUsage ? [
                'consultas_used' => $user->currentUsage->consultas_used,
                'consultas_limit' => $user->currentUsage->consultas_limit,
                'period_key' => $user->currentUsage->period_key,
            ] : null,
            'auditLogs' => $user->auditLogs()->with('actor')->latest()->limit(20)->get()->map(fn($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'actor_name' => $log->actor?->name ?? 'Sistema',
                'payload' => $log->payload,
                'created_at' => $log->created_at->format('d/m/Y H:i'),
            ]),
            'plans' => $plans,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load(['roles', 'activeSubscription.plan']);

        $roles = Role::all(['id', 'name', 'display_name']);
        $plans = Plan::where('is_active', true)->get()->map(fn($plan) => [
            'id' => $plan->id,
            'name' => $plan->name,
            'price' => $plan->price,
            'interval' => $plan->interval,
            'trial_days' => $plan->trial_days,
        ]);

        return Inertia::render('Admin/UserForm', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->roles->pluck('id')->toArray(),
                'subscription' => $user->activeSubscription ? [
                    'id' => $user->activeSubscription->id,
                    'plan_id' => $user->activeSubscription->plan_id,
                    'status' => $user->activeSubscription->status,
                    'current_period_end' => $user->activeSubscription->current_period_end?->format('Y-m-d'),
                ] : null,
            ],
            'roles' => $roles,
            'plans' => $plans,
            'mode' => 'edit',
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $oldValues = $user->only(['name', 'email', 'phone', 'status']);

        return DB::transaction(function () use ($validated, $user, $oldValues, $request) {
            if ($this->isRemovingLastAdmin($user, $validated['roles'])) {
                return back()->withErrors(['roles' => 'Nao e possivel remover o ultimo administrador do sistema.']);
            }

            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'status' => $validated['status'],
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);
            $user->roles()->sync($validated['roles']);

            if ($request->boolean('create_subscription') && !empty($validated['plan_id'])) {
                $plan = Plan::findOrFail($validated['plan_id']);
                if (!$user->activeSubscription) {
                    $this->subscriptionService->subscribe($user, $plan, 'manual', null, \App\Models\Subscription::STATUS_ACTIVE);
                    
                    AuditLog::log(
                        'user.subscription_created',
                        auth()->id(),
                        $user->id,
                        'Subscription',
                        null,
                        ['plan_id' => $plan->id, 'plan_name' => $plan->name, 'type' => 'manual_via_update']
                    );
                }
            }

            AuditLog::log(
                'user.updated',
                auth()->id(),
                $user->id,
                'User',
                $user->id,
                null,
                $oldValues,
                $user->only(['name', 'email', 'phone', 'status'])
            );

            return redirect()->route('admin.users.index')
                ->with('success', 'Usuario atualizado com sucesso.');
        });
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($this->isLastAdmin($user)) {
            return back()->withErrors(['error' => 'Nao e possivel excluir o ultimo administrador do sistema.']);
        }

        $subscription = $user->activeSubscription;
        if ($subscription) {
            $this->subscriptionService->cancel($subscription, false);
        }

        $user->delete();

        AuditLog::log('user.deleted', auth()->id(), $user->id, 'User', $user->id);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario excluido com sucesso.');
    }

    public function restore(int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        AuditLog::log('user.restored', auth()->id(), $user->id, 'User', $user->id);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario restaurado com sucesso.');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        if ($this->isLastAdmin($user)) {
            return back()->withErrors(['error' => 'Nao e possivel excluir o ultimo administrador do sistema.']);
        }
        
        $user->forceDelete();

        AuditLog::log('user.force_deleted', auth()->id(), null, 'User', null, [
            'old_id' => $id,
            'name' => $user->name, 
            'email' => $user->email
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario excluido permanentemente.');
    }

    public function block(User $user): RedirectResponse
    {
        if ($this->isLastAdmin($user)) {
            return back()->withErrors(['error' => 'Nao e possivel bloquear o ultimo administrador.']);
        }

        $user->update(['status' => User::STATUS_BLOCKED]);

        AuditLog::log('user.blocked', auth()->id(), $user->id, 'User', $user->id);

        return back()->with('success', 'Usuario bloqueado com sucesso.');
    }

    public function unblock(User $user): RedirectResponse
    {
        $user->update(['status' => User::STATUS_ACTIVE]);

        AuditLog::log('user.unblocked', auth()->id(), $user->id, 'User', $user->id);

        return back()->with('success', 'Usuario desbloqueado com sucesso.');
    }

    public function verify(User $user): RedirectResponse
    {
        $user->markEmailAsVerified();

        AuditLog::log('user.verified', auth()->id(), $user->id, 'User', $user->id);

        return back()->with('success', 'Usuario verificado com sucesso.');
    }

    public function changePlan(Request $request, User $user, SubscriptionService $subscriptionService): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'immediate' => 'boolean',
            'generate_payment' => 'boolean',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $immediate = $validated['immediate'] ?? true;
        $generatePayment = $validated['generate_payment'] ?? false;

        try {
            $subscription = $user->activeSubscription;

            if ($subscription) {
                $subscription = $subscriptionService->changePlan($subscription, $plan, $immediate);
            } else {
                $subscription = $subscriptionService->subscribe($user, $plan, 'manual', null, \App\Models\Subscription::STATUS_ACTIVE);
            }

            if ($generatePayment && $plan->price_cents > 0) {
                $payment = $subscriptionService->createPayment($subscription, $plan->price_cents, 'manual');
                $subscriptionService->confirmPayment($payment);
            }

            AuditLog::log('user.plan_changed', auth()->id(), $user->id, 'Subscription', null, [
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ]);

            return back()->with('success', 'Plano alterado com sucesso.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao alterar plano: ' . $e->getMessage()]);
        }
    }

    public function cancelSubscription(Request $request, User $user): RedirectResponse
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return back()->withErrors(['error' => 'Usuario nao possui assinatura ativa.']);
        }

        $this->subscriptionService->cancel($subscription, $request->boolean('at_period_end', true));

        AuditLog::log('user.subscription_canceled', auth()->id(), $user->id, 'Subscription', $subscription->id);

        return back()->with('success', 'Assinatura cancelada com sucesso.');
    }

    public function reactivateSubscription(User $user): RedirectResponse
    {
        $subscription = $user->subscriptions()->latest()->first();

        if (!$subscription) {
            return back()->withErrors(['error' => 'Usuario nao possui assinatura.']);
        }

        $this->subscriptionService->reactivate($subscription);

        AuditLog::log('user.subscription_reactivated', auth()->id(), $user->id, 'Subscription', $subscription->id);

        return back()->with('success', 'Assinatura reativada com sucesso.');
    }

    public function resetUsage(User $user): RedirectResponse
    {
        $usage = $user->currentUsage;

        if ($usage) {
            $oldValue = $usage->consultas_used;
            $usage->update(['consultas_used' => 0]);

            AuditLog::log('user.usage_reset', auth()->id(), $user->id, 'UsageCounter', $usage->id, [
                'old_value' => $oldValue,
            ]);
        }

        return back()->with('success', 'Consumo resetado com sucesso.');
    }

    public function adjustPeriod(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'current_period_end' => 'required|date|after:today',
        ]);

        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return back()->withErrors(['error' => 'Usuario nao possui assinatura ativa.']);
        }

        $oldEnd = $subscription->current_period_end;
        $subscription->update([
            'current_period_end' => $validated['current_period_end'],
            'next_billing_at' => $validated['current_period_end'],
        ]);

        AuditLog::log('user.period_adjusted', auth()->id(), $user->id, 'Subscription', $subscription->id, [
            'old_end' => $oldEnd?->format('Y-m-d'),
            'new_end' => $validated['current_period_end'],
        ]);

        return back()->with('success', 'Periodo ajustado com sucesso.');
    }

    private function isLastAdmin(User $user): bool
    {
        if (!$user->hasRole('admin')) {
            return false;
        }

        $adminCount = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->count();
        return $adminCount <= 1;
    }

    private function isRemovingLastAdmin(User $user, array $newRoleIds): bool
    {
        if (!$user->hasRole('admin')) {
            return false;
        }

        $adminRole = Role::where('name', 'admin')->first();
        if (!$adminRole) {
            return false;
        }

        if (in_array($adminRole->id, $newRoleIds)) {
            return false;
        }

        $adminCount = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->count();
        return $adminCount <= 1;
    }
}
