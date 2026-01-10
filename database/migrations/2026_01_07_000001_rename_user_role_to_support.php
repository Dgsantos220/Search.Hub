<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Renomear role 'user' para 'support'
        DB::table('roles')->where('name', 'user')->update([
            'name' => 'support',
            'display_name' => 'Suporte',
            'description' => 'Equipe de Suporte e Atendimento'
        ]);

        // Opcional: Garantir que admin esteja como 'Administrador'
        DB::table('roles')->where('name', 'admin')->update([
            'display_name' => 'Administrador',
            'description' => 'Acesso total ao sistema'
        ]);
    }

    public function down(): void
    {
        DB::table('roles')->where('name', 'support')->update([
            'name' => 'user',
            'display_name' => 'User',
            'description' => 'Standard user'
        ]);
    }
};
