<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Artigo e versões, cada um com o próprio estado (REQUIREMENTS §5, D79).
 * Cada versão é uma cópia completa do conteúdo. O artigo aponta para a
 * versão em vigor, a que o público lê; a lixeira é a exclusão suave.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            // O artigo publicado sobrevive à conta, com autoria anonimizada (fatia 22)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('state', 20)->default('unpublished');
            $table->unsignedBigInteger('current_version_id')->nullable();
            // Primeira publicação, para "publicado em" e "atualizado em" (RF-137)
            $table->timestamp('first_published_at')->nullable();
            $table->timestamps();
            // Na lixeira (RF-340): o estado continua guardado para a restauração
            $table->softDeletes();

            $table->index(['user_id', 'state']);
        });

        Schema::create('article_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('draft');
            // Um rascunho pode ser salvo vazio (RF-318); o envio exige os campos
            $table->string('title', 150)->nullable();
            $table->json('content')->nullable();
            // Texto puro extraído do conteúdo, para busca e contagens (D51)
            $table->longText('content_text')->nullable();
            $table->string('language', 5)->nullable();
            // Excluir uma categoria exige transferir os artigos antes (RF-126)
            $table->foreignId('category_id')->nullable()->constrained()->restrictOnDelete();
            // A versão de onde este rascunho partiu (rejeitada ou em vigor)
            $table->foreignId('based_on_id')->nullable()->constrained('article_versions')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('decision_reason')->nullable();
            $table->timestamps();

            // No máximo um rascunho, uma pendente e uma em vigor por artigo (RF-351),
            // garantido pelo banco mesmo com dois pedidos ao mesmo tempo.
            $table->unsignedBigInteger('draft_slot')->nullable()->virtualAs("if(status = 'draft', article_id, null)");
            $table->unsignedBigInteger('pending_slot')->nullable()->virtualAs("if(status = 'pending', article_id, null)");
            $table->unsignedBigInteger('approved_slot')->nullable()->virtualAs("if(status = 'approved', article_id, null)");
            $table->unique('draft_slot');
            $table->unique('pending_slot');
            $table->unique('approved_slot');

            $table->index(['status', 'submitted_at']);
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->foreign('current_version_id')->references('id')->on('article_versions')->nullOnDelete();
        });

        Schema::create('article_version_tag', function (Blueprint $table) {
            $table->foreignId('article_version_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['article_version_id', 'tag_id']);
            $table->index('tag_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_version_tag');
        Schema::table('articles', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });
        Schema::dropIfExists('article_versions');
        Schema::dropIfExists('articles');
    }
};
