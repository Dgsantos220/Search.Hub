<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\User;
use App\Models\Role;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminActionsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $regularUser;
    protected Plan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'admin', 'slug' => 'admin']);
        $userRole = Role::create(['name' => 'user', 'slug' => 'user']);

        $this->admin = User::factory()->create([
            'email' => 'admin@test.com',
            'email_verified_at' => now(),
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->regularUser = User::factory()->create([
            'email' => 'user@test.com',
            'email_verified_at' => now(),
        ]);
        $this->regularUser->roles()->attach($userRole);

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

    public function test_admin_can_access_admin_dashboard(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin');

        $response->assertStatus(200);
    }

    public function test_regular_user_cannot_access_admin_dashboard(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get('/admin');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_users_list(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/users');

        $response->assertStatus(200);
    }

    public function test_admin_can_view_plans(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/plans');

        $response->assertStatus(200);
    }

    public function test_admin_can_approve_payment(): void
    {
        $subscriptionService = app(SubscriptionService::class);
        $subscription = $subscriptionService->subscribe($this->regularUser, $this->plan, 'manual');
        
        $payment = Payment::create([
            'subscription_id' => $subscription->id,
            'user_id' => $this->regularUser->id,
            'plan_id' => $this->plan->id,
            'amount_cents' => $this->plan->price_cents,
            'currency' => 'BRL',
            'status' => Payment::STATUS_PENDING,
            'provider' => 'manual',
            'provider_reference' => 'manual_test_' . uniqid(),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/subscriptions/payments/{$payment->id}/approve");

        $response->assertStatus(200);
        
        $payment->refresh();
        $this->assertEquals(Payment::STATUS_PAID, $payment->status);
    }

    public function test_admin_can_reject_payment(): void
    {
        $subscriptionService = app(SubscriptionService::class);
        $subscription = $subscriptionService->subscribe($this->regularUser, $this->plan, 'manual');
        
        $payment = Payment::create([
            'subscription_id' => $subscription->id,
            'user_id' => $this->regularUser->id,
            'plan_id' => $this->plan->id,
            'amount_cents' => $this->plan->price_cents,
            'currency' => 'BRL',
            'status' => Payment::STATUS_PENDING,
            'provider' => 'manual',
            'provider_reference' => 'manual_test_' . uniqid(),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/subscriptions/payments/{$payment->id}/reject", [
                'reason' => 'Pagamento nao confirmado',
            ]);

        $response->assertStatus(200);
        
        $payment->refresh();
        $this->assertEquals(Payment::STATUS_FAILED, $payment->status);
    }
}
