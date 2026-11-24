<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comentários e curtidas (RF-138 a RF-158, D88). Comentário pertence ao
 * artigo, não à versão: uma edição aprovada mantém a conversa. Apagar um
 * comentário apaga as respostas (RF-146); apagar a conta apaga o que ela
 * escreveu e curtiu (RF-158, RF-361). Uma curtida por pessoa e item,
 * garantida pelo banco (p6-02).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            // 1 a 3 (RF-138)
            $table->unsignedTinyInteger('depth')->default(1);
            $table->text('body');
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();

            $table->index(['article_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('article_likes', function (Blueprint $table) {
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['article_id', 'user_id']);
            // "Mais curtidos" conta as curtidas de um período (RF-134)
            $table->index(['article_id', 'created_at']);
        });

        Schema::create('comment_likes', function (Blueprint $table) {
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['comment_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_likes');
        Schema::dropIfExists('article_likes');
        Schema::dropIfExists('comments');
    }
};
