<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('role_user')->truncate();
        User::truncate();

        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@m7consultas.com',
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
        ]);

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->roles()->attach($adminRole->id);
        }

        $usuario = User::create([
            'name' => 'Usuario Teste',
            'email' => 'usuario@m7consultas.com',
            'password' => Hash::make('usuario123'),
            'email_verified_at' => now(),
        ]);

        $clienteRole = Role::where('name', 'cliente')->first();
        if ($clienteRole) {
            $usuario->roles()->attach($clienteRole->id);
        }
    }
}
