<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Billing\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected BillingService $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    public function handleManual(Request $request): JsonResponse
    {
        Log::info('Manual webhook received', $request->all());

        $result = $this->billingService->handleWebhook('manual', $request->all());

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function handleMercadoPago(Request $request): JsonResponse
    {
        Log::info('MercadoPago webhook received', $request->all());

        $payload = $request->all();
        
        $result = $this->billingService->handleWebhook('mercadopago', $payload);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function handleStripe(Request $request): JsonResponse
    {
        Log::info('Stripe webhook received');

        $payload = [
            'raw_payload' => $request->getContent(),
            'signature' => $request->header('Stripe-Signature'),
            'event' => $request->all(),
        ];

        $result = $this->billingService->handleWebhook('stripe', $payload);

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}
