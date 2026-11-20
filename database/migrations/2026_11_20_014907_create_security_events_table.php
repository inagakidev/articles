<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Eventos de segurança da conta (REQUIREMENTS.md RF-022 e RF-024).
     */
    public function up(): void
    {
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            // Nulo quando o e-mail tentado não pertence a nenhuma conta.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 40);
            // O e-mail digitado, para analisar tentativas contra contas inexistentes.
            $table->string('email')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};
