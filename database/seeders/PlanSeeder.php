<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Teste Grátis',
                'slug' => 'gratis',
                'description' => 'Plano de demonstração: 1 consulta grátis.',
                'price_cents' => 0,
                'currency' => 'BRL',
                'interval' => 'monthly',
                'features' => ['cpf'],
                'limits' => [
                    'consultas_por_mes' => 1,
                    'consultas_por_dia' => 1,
                    'rate_limit' => 5,
                ],
                'trial_days' => null,
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Básico',
                'slug' => 'basico',
                'description' => 'Plano ideal para usuários iniciantes com necessidades básicas de consulta.',
                'price_cents' => 4990,
                'currency' => 'BRL',
                'interval' => 'monthly',
                'features' => ['cpf', 'telefone', 'email'],
                'limits' => [
                    'consultas_por_mes' => 100,
                    'consultas_por_dia' => 10,
                    'rate_limit' => 30,
                ],
                'trial_days' => 7,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Profissional',
                'slug' => 'profissional',
                'description' => 'Para profissionais que precisam de mais consultas e recursos avançados.',
                'price_cents' => 9990,
                'currency' => 'BRL',
                'interval' => 'monthly',
                'features' => ['cpf', 'telefone', 'email', 'nome', 'rg', 'parentes'],
                'limits' => [
                    'consultas_por_mes' => 500,
                    'consultas_por_dia' => 50,
                    'rate_limit' => 60,
                ],
                'trial_days' => null,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Empresarial',
                'slug' => 'empresarial',
                'description' => 'Solução completa para empresas com alto volume de consultas.',
                'price_cents' => 29990,
                'currency' => 'BRL',
                'interval' => 'monthly',
                'features' => ['cpf', 'telefone', 'email', 'nome', 'rg', 'parentes', 'score', 'poder_aquisitivo', 'tse', 'pis'],
                'limits' => [
                    'consultas_por_mes' => 5000,
                    'consultas_por_dia' => 500,
                    'rate_limit' => 120,
                ],
                'trial_days' => null,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }

        $this->command->info('Plans seeded successfully!');
    }
}
