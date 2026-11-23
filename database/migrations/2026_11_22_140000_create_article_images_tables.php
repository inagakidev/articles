<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Imagens dos artigos (RF-079 a RF-091, D52, D81). A imagem pertence ao
 * artigo, e não à versão: as versões só a citam, então uma imagem repetida
 * entre versões é um arquivo só e conta uma vez (RF-089).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_images', function (Blueprint $table) {
            $table->id();
            // Nome no disco de mídia e na URL; o id numérico não aparece
            $table->uuid('uuid')->unique();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('height');
            $table->unsignedInteger('size');
            // Larguras já geradas pela fila; vazio enquanto só existe o original
            $table->json('variants')->nullable();
            $table->timestamps();

            // A limpeza de imagens sem uso (p4-11) procura pelas mais antigas
            $table->index('created_at');
        });

        Schema::create('article_version_image', function (Blueprint $table) {
            $table->foreignId('article_version_id')->constrained()->cascadeOnDelete();
            $table->foreignId('article_image_id')->constrained()->cascadeOnDelete();
            $table->primary(['article_version_id', 'article_image_id']);
            $table->index('article_image_id');
        });

        Schema::table('article_versions', function (Blueprint $table) {
            // Capa opcional (RF-079), com texto alternativo ou decorativa (RF-087)
            $table->foreignId('cover_image_id')->nullable()->after('category_id')->constrained('article_images')->nullOnDelete();
            $table->string('cover_alt', 250)->nullable()->after('cover_image_id');
            $table->boolean('cover_decorative')->default(false)->after('cover_alt');
        });
    }

    public function down(): void
    {
        Schema::table('article_versions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cover_image_id');
            $table->dropColumn(['cover_alt', 'cover_decorative']);
        });
        Schema::dropIfExists('article_version_image');
        Schema::dropIfExists('article_images');
    }
};
