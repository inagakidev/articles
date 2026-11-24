<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Denúncias de artigos, comentários e perfis (RF-164 a RF-178, D91)
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            // Quem denunciou; a denúncia fica se a conta sair (RF-373)
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('target', 20);
            $table->unsignedBigInteger('target_id');
            $table->string('reason', 20);
            $table->text('details')->nullable();
            $table->string('status', 20)->default('open');
            // 1 enquanto aberta, nulo depois: o índice único só vale para as abertas (RF-167)
            $table->boolean('open')->nullable()->default(true);
            $table->string('outcome', 30)->nullable();
            $table->string('policy_item', 10)->nullable();
            $table->text('justification')->nullable();
            $table->foreignId('decided_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->unique(['reporter_id', 'target', 'target_id', 'open']);
            $table->index(['status', 'target', 'target_id']);
        });

        // Username inadequado: a troca é obrigatória no próximo acesso (RF-178)
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('username_change_required_at')->nullable()->after('username');
            $table->string('username_change_policy_item', 10)->nullable()->after('username_change_required_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username_change_required_at', 'username_change_policy_item']);
        });
        Schema::dropIfExists('reports');
    }
};
