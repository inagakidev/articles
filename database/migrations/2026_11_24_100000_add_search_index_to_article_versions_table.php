<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Busca no título e no texto (RF-130, D54): FULLTEXT do MariaDB, consultado
 * só pelo `ArticleSearch`. Termos com menos de 3 letras não entram no índice
 * e são tratados à parte (D85).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('article_versions', function (Blueprint $table) {
            $table->fullText(['title', 'content_text'], 'article_versions_search');
        });
    }

    public function down(): void
    {
        Schema::table('article_versions', function (Blueprint $table) {
            $table->dropFullText('article_versions_search');
        });
    }
};
