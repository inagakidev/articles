<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('banned_at')->nullable();
            $table->timestamp('suspended_until')->nullable();
        });

        Schema::create('penalties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('decided_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 20);
            $table->string('policy_item', 10);
            $table->text('reason');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('appeal_deadline_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type', 'ended_at']);
        });

        Schema::create('appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penalty_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('justification');
            $table->string('status', 20)->default('open');
            $table->foreignId('decided_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('decision_reason')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamp('reopen_deadline_at')->nullable();
            $table->timestamps();

            $table->unique(['penalty_id']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appeals');
        Schema::dropIfExists('penalties');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['banned_at', 'suspended_until']);
        });
    }
};
