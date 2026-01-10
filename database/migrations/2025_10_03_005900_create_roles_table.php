<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        DB::table('roles')->insert([
            [
                'name' => 'admin',
                'display_name' => 'Administrador',
                'description' => 'Acesso total ao sistema',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'cliente',
                'display_name' => 'Cliente',
                'description' => 'Acesso de cliente padrão',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
