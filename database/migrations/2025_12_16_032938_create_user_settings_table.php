<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('theme', 20)->default('dark');
            $table->string('language', 10)->default('pt-BR');
            $table->string('timezone', 50)->default('America/Sao_Paulo');
            $table->boolean('notifications_email')->default(true);
            $table->boolean('notifications_push')->default(false);
            $table->boolean('two_factor_enabled')->default(false);
            $table->json('preferences')->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
