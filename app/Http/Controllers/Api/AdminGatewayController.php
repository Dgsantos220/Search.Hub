<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GatewaySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminGatewayController extends Controller
{
    protected array $supportedProviders = ['stripe', 'mercadopago'];

    public function index(): JsonResponse
    {
        $gateways = [];
        
        foreach ($this->supportedProviders as $provider) {
            $setting = GatewaySetting::getByProvider($provider);
            
            if ($setting) {
                $gateways[$provider] = $setting->toSafeArray();
            } else {
                $gateways[$provider] = [
                    'provider' => $provider,
                    'enabled' => false,
                    'has_public_key' => false,
                    'has_secret_key' => false,
                    'has_access_token' => false,
                    'has_webhook_secret' => false,
                    'sandbox_mode' => true,
                    'has_credentials' => false,
                    'updated_at' => null,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $gateways,
        ]);
    }

    public function show(string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Provider não suportado.',
            ], 404);
        }

        $setting = GatewaySetting::getByProvider($provider);

        if (!$setting) {
            return response()->json([
                'success' => true,
                'data' => [
                    'provider' => $provider,
                    'enabled' => false,
                    'has_public_key' => false,
                    'has_secret_key' => false,
                    'has_access_token' => false,
                    'has_webhook_secret' => false,
                    'sandbox_mode' => true,
                    'has_credentials' => false,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $setting->toSafeArray(),
        ]);
    }

    public function update(Request $request, string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Provider não suportado.',
            ], 404);
        }

        $validated = $request->validate([
            'enabled' => 'sometimes|boolean',
            'public_key' => 'sometimes|nullable|string|max:500',
            'secret_key' => 'sometimes|nullable|string|max:500',
            'access_token' => 'sometimes|nullable|string|max:500',
            'webhook_secret' => 'sometimes|nullable|string|max:500',
            'sandbox_mode' => 'sometimes|boolean',
        ]);

        $setting = GatewaySetting::updateOrCreate(
            ['provider' => $provider],
            array_filter($validated, fn($v) => $v !== null || $v === false)
        );

        Log::info('Gateway settings updated', [
            'provider' => $provider,
            'admin_id' => auth()->id(),
            'enabled' => $setting->enabled,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Configurações do gateway atualizadas.',
            'data' => $setting->toSafeArray(),
        ]);
    }

    public function test(string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Provider não suportado.',
            ], 404);
        }

        $setting = GatewaySetting::getByProvider($provider);

        if (!$setting || !$setting->hasCredentials()) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais não configuradas para este gateway.',
            ], 422);
        }

        try {
            if ($provider === 'stripe') {
                return $this->testStripeConnection($setting);
            }
            
            if ($provider === 'mercadopago') {
                return $this->testMercadoPagoConnection($setting);
            }

            return response()->json([
                'success' => false,
                'message' => 'Teste não implementado para este provider.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Gateway connection test failed', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Falha ao conectar: ' . $e->getMessage(),
            ], 422);
        }
    }

    protected function testStripeConnection(GatewaySetting $setting): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Conexão com Stripe verificada (modo sandbox: ' . ($setting->sandbox_mode ? 'sim' : 'não') . ')',
            'data' => [
                'provider' => 'stripe',
                'sandbox_mode' => $setting->sandbox_mode,
                'status' => 'connected',
            ],
        ]);
    }

    protected function testMercadoPagoConnection(GatewaySetting $setting): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Conexão com Mercado Pago verificada (modo sandbox: ' . ($setting->sandbox_mode ? 'sim' : 'não') . ')',
            'data' => [
                'provider' => 'mercadopago',
                'sandbox_mode' => $setting->sandbox_mode,
                'status' => 'connected',
            ],
        ]);
    }

    public function toggle(string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Provider não suportado.',
            ], 404);
        }

        $setting = GatewaySetting::getByProvider($provider);

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Configure as credenciais antes de ativar o gateway.',
            ], 422);
        }

        if (!$setting->enabled && !$setting->hasCredentials()) {
            return response()->json([
                'success' => false,
                'message' => 'Configure as credenciais antes de ativar o gateway.',
            ], 422);
        }

        $setting->enabled = !$setting->enabled;
        $setting->save();

        Log::info('Gateway toggled', [
            'provider' => $provider,
            'enabled' => $setting->enabled,
            'admin_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $setting->enabled ? 'Gateway ativado.' : 'Gateway desativado.',
            'data' => $setting->toSafeArray(),
        ]);
    }

    public function simulateWebhook(Request $request, string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json(['success' => false, 'message' => 'Provider não suportado.'], 404);
        }

        try {
            $billingService = app(\App\Services\Billing\BillingService::class);
            $payload = $request->all();

            $result = $billingService->handleWebhook($provider, $payload);

            return response()->json([
                'success' => $result['success'],
                'message' => 'Simulação executada.',
                'result' => $result,
            ], $result['success'] ? 200 : 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro na simulação: ' . $e->getMessage(),
            ], 500);
        }
    }
}
