<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->unique();
            $table->boolean('enabled')->default(false);
            $table->text('public_key')->nullable();
            $table->text('secret_key')->nullable();
            $table->text('access_token')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->boolean('sandbox_mode')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateway_settings');
    }
};
