<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['name' => 'admin', 'display_name' => 'Administrador', 'description' => 'Administrator with full access']
        );

        Role::firstOrCreate(
            ['name' => 'user'],
            ['name' => 'user', 'display_name' => 'User', 'description' => 'Standard user']
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@m7consultas.com'],
            [
                'name' => 'Administrador',
                'email' => 'admin@m7consultas.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        if (!$admin->roles()->where('name', 'admin')->exists()) {
            $admin->roles()->attach($adminRole);
        }

        $this->command->info('Admin user seeded successfully!');
        $this->command->info('Email: admin@m7consultas.com');
        $this->command->info('Password: admin123');
    }
}
