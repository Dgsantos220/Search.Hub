<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\User;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultaIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Plan $plan;
    protected Subscription $subscription;

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

        $subscriptionService = app(SubscriptionService::class);
        $this->subscription = $subscriptionService->subscribe($this->user, $this->plan, 'manual');
    }

    public function test_consulta_requires_authentication(): void
    {
        $response = $this->getJson('/api/consulta/cpf/12345678900');

        $response->assertStatus(401);
    }

    public function test_consulta_requires_active_subscription(): void
    {
        $userWithoutSubscription = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($userWithoutSubscription)
            ->getJson('/api/consulta/cpf/12345678900');

        $response->assertStatus(403);
    }

    public function test_authenticated_user_with_subscription_can_consulta(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/consulta/cpf/12345678900');

        $response->assertStatus(200);
    }

    public function test_consulta_by_telefone(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/consulta/telefone/11999999999');

        $response->assertStatus(200);
    }

    public function test_consulta_by_email(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/consulta/email/teste@email.com');

        $response->assertStatus(200);
    }

    public function test_consulta_by_nome(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/consulta/nome?nome=JOAO&uf=SP');

        $response->assertStatus(200);
    }
}
