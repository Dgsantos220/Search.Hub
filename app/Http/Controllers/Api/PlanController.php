<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Plan::query();

        if (!$request->user()?->hasRole('admin')) {
            $query->active();
        }

        if ($request->has('with_deleted') && $request->user()?->hasRole('admin')) {
            $query->withTrashed();
        }

        $plans = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $plans->map(fn($plan) => $this->formatPlan($plan)),
        ]);
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatPlan($plan),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:plans,slug',
            'description' => 'nullable|string',
            'price_cents' => 'required|integer|min:0',
            'currency' => 'nullable|string|size:3',
            'interval' => 'required|in:monthly,yearly,one_time',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'limits.consultas_por_mes' => 'nullable|integer|min:0',
            'limits.consultas_por_dia' => 'nullable|integer|min:0',
            'trial_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $plan = Plan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Plano criado com sucesso.',
            'data' => $this->formatPlan($plan),
        ], 201);
    }

    public function update(Request $request, Plan $plan): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('plans')->ignore($plan->id)],
            'description' => 'nullable|string',
            'price_cents' => 'sometimes|integer|min:0',
            'currency' => 'nullable|string|size:3',
            'interval' => 'sometimes|in:monthly,yearly,one_time',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'limits.consultas_por_mes' => 'nullable|integer|min:0',
            'limits.consultas_por_dia' => 'nullable|integer|min:0',
            'trial_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $plan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Plano atualizado com sucesso.',
            'data' => $this->formatPlan($plan->fresh()),
        ]);
    }

    public function destroy(Plan $plan): JsonResponse
    {
        if ($plan->subscriptions()->whereIn('status', ['active', 'trialing'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir um plano com assinaturas ativas.',
            ], 422);
        }

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plano excluído com sucesso.',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $plan = Plan::withTrashed()->findOrFail($id);
        $plan->restore();

        return response()->json([
            'success' => true,
            'message' => 'Plano restaurado com sucesso.',
            'data' => $this->formatPlan($plan),
        ]);
    }

    public function duplicate(Plan $plan): JsonResponse
    {
        $newPlan = $plan->replicate();
        $newPlan->name = $plan->name . ' (Cópia)';
        $newPlan->slug = $plan->slug . '-copy-' . Str::random(4);
        $newPlan->is_active = false;
        $newPlan->save();

        return response()->json([
            'success' => true,
            'message' => 'Plano duplicado com sucesso.',
            'data' => $this->formatPlan($newPlan),
        ], 201);
    }

    public function toggleActive(Plan $plan): JsonResponse
    {
        $plan->update(['is_active' => !$plan->is_active]);

        return response()->json([
            'success' => true,
            'message' => $plan->is_active ? 'Plano ativado.' : 'Plano desativado.',
            'data' => $this->formatPlan($plan),
        ]);
    }

    protected function formatPlan(Plan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'slug' => $plan->slug,
            'description' => $plan->description,
            'price_cents' => $plan->price_cents,
            'price' => $plan->price,
            'formatted_price' => $plan->formatted_price,
            'currency' => $plan->currency,
            'interval' => $plan->interval,
            'interval_label' => match($plan->interval) {
                'monthly' => 'Mensal',
                'yearly' => 'Anual',
                'one_time' => 'Único',
                default => $plan->interval,
            },
            'features' => $plan->features ?? [],
            'limits' => $plan->limits ?? [],
            'monthly_limit' => $plan->monthly_limit,
            'daily_limit' => $plan->daily_limit,
            'trial_days' => $plan->trial_days,
            'is_active' => $plan->is_active,
            'sort_order' => $plan->sort_order,
            'subscribers_count' => $plan->subscriptions()->whereIn('status', ['active', 'trialing'])->count(),
            'deleted_at' => $plan->deleted_at?->toIso8601String(),
            'created_at' => $plan->created_at->toIso8601String(),
            'updated_at' => $plan->updated_at->toIso8601String(),
        ];
    }
}
