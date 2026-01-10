<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Payment;
use App\Services\SubscriptionService;
use App\Services\Billing\BillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Plan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->plan = Plan::create([
            'name' => 'Plano Teste',
            'slug' => 'plano-teste',
            'description' => 'Plano para testes',
            'price_cents' => 9900,
            'currency' => 'BRL',
            'interval' => 'monthly',
            'monthly_limit' => 100,
            'daily_limit' => 10,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    public function test_user_can_subscribe_to_plan(): void
    {
        $subscriptionService = app(SubscriptionService::class);
        
        $subscription = $subscriptionService->subscribe($this->user, $this->plan, 'manual');

        $this->assertNotNull($subscription);
        $this->assertEquals($this->user->id, $subscription->user_id);
        $this->assertEquals($this->plan->id, $subscription->plan_id);
        $this->assertEquals('active', $subscription->status);
        $this->assertEquals('manual', $subscription->provider);
    }

    public function test_user_can_cancel_subscription(): void
    {
        $subscriptionService = app(SubscriptionService::class);
        
        $subscription = $subscriptionService->subscribe($this->user, $this->plan, 'manual');
        
        $canceledSubscription = $subscriptionService->cancel($subscription, true);

        $this->assertTrue($canceledSubscription->cancel_at_period_end);
        $this->assertNotNull($canceledSubscription->canceled_at);
    }

    public function test_user_can_change_plan(): void
    {
        $subscriptionService = app(SubscriptionService::class);
        
        $newPlan = Plan::create([
            'name' => 'Plano Premium',
            'slug' => 'plano-premium',
            'description' => 'Plano premium para testes',
            'price_cents' => 19900,
            'currency' => 'BRL',
            'interval' => 'monthly',
            'monthly_limit' => 500,
            'daily_limit' => 50,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $subscription = $subscriptionService->subscribe($this->user, $this->plan, 'manual');
        $updatedSubscription = $subscriptionService->changePlan($subscription, $newPlan, true);

        $this->assertEquals($newPlan->id, $updatedSubscription->plan_id);
    }

    public function test_checkout_api_requires_authentication(): void
    {
        $response = $this->postJson('/api/subscriptions/checkout', [
            'plan_id' => $this->plan->id,
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_checkout(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/subscriptions/checkout', [
                'plan_id' => $this->plan->id,
                'provider' => 'manual',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $this->user->id,
            'plan_id' => $this->plan->id,
        ]);
    }

    public function test_user_can_view_subscription_status(): void
    {
        $subscriptionService = app(SubscriptionService::class);
        $subscriptionService->subscribe($this->user, $this->plan, 'manual');

        $this->user->refresh();

        $response = $this->actingAs($this->user)
            ->getJson('/api/subscriptions/me');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'has_subscription',
            ],
        ]);
    }

    public function test_payment_is_created_with_subscription(): void
    {
        $billingService = app(BillingService::class);
        
        $result = $billingService->createCheckout($this->user, $this->plan, 'manual');

        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('payment_id', $result);
        
        $this->assertDatabaseHas('payments', [
            'user_id' => $this->user->id,
            'plan_id' => $this->plan->id,
            'provider' => 'manual',
        ]);
    }
}
