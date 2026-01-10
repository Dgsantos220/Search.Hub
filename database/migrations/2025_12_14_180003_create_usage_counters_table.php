<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('period_key', 7);
            $table->integer('used_count')->default(0);
            $table->integer('limit_count')->default(0);
            $table->integer('daily_used')->default(0);
            $table->integer('daily_limit')->default(0);
            $table->date('last_reset_date')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'period_key']);
            $table->index('period_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_counters');
    }
};
