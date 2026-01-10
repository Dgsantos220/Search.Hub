<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_subscriptions' => 0,
                'active_subscriptions' => 0,
                'monthly_revenue' => 0,
                'mrr' => 0,
            ],
        ]);
    }

    public function plans(): JsonResponse
    {
        $plans = [
            [
                'id' => 1,
                'name' => 'Basic',
                'price' => 49.90,
                'features' => ['100 Consultas/mês', 'Suporte Básico'],
                'active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Pro',
                'price' => 97.00,
                'features' => ['500 Consultas/mês', 'API Access', 'Suporte Prioritário'],
                'active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Enterprise',
                'price' => 299.00,
                'features' => ['Consultas Ilimitadas', 'API Dedicada', 'Gerente de Conta'],
                'active' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    public function transactions(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
            'pagination' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 20,
                'total' => 0,
            ],
        ]);
    }

    public function gateways(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'stripe' => [
                    'enabled' => false,
                    'configured' => false,
                ],
                'mercadopago' => [
                    'enabled' => false,
                    'configured' => false,
                ],
            ],
        ]);
    }
}
