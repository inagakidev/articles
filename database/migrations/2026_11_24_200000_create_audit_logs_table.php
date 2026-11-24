<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registro de auditoria das ações administrativas (RF-291 a RF-293, D87):
 * só inclusões. O alvo é guardado também como texto, para o registro
 * continuar legível depois que o artigo ou a conta deixarem de existir.
 * A decisão da moderação passa a guardar o item da Política de conteúdo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            // Nulo nas rotinas automáticas (lixeira vencida)
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40);
            $table->string('subject_type', 40)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label', 255);
            $table->string('policy_item', 10)->nullable();
            $table->text('reason')->nullable();
            $table->json('details')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['action', 'created_at']);
            $table->index('created_at');
        });

        Schema::table('article_versions', function (Blueprint $table) {
            // Item da Política de conteúdo citado na rejeição ou despublicação (RF-107, RF-111)
            $table->string('decision_policy_item', 10)->nullable()->after('decision_reason');
        });
    }

    public function down(): void
    {
        Schema::table('article_versions', function (Blueprint $table) {
            $table->dropColumn('decision_policy_item');
        });
        Schema::dropIfExists('audit_logs');
    }
};
