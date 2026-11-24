<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Endereço público do artigo, `/artigos/{slug}` (D83). Nasce na primeira
 * publicação e nunca muda, para os links compartilhados não quebrarem.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('slug', 120)->nullable()->unique()->after('state');
            // Listagem pública: publicados, do mais novo para o mais antigo (RF-136)
            $table->index(['state', 'first_published_at']);
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndex(['state', 'first_published_at']);
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
