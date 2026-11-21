<?php

use App\Domain\Taxonomy\Rules\TagName;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Chave aproximada da tag, guardada e indexada para as sugestões de união
 * (D79): a tela consulta só as tags parecidas com as da página, em vez de
 * comparar todas a cada abertura.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->string('loose_key', 40)->default('')->after('name')->index();
        });

        DB::table('tags')->orderBy('id')->each(function (object $tag) {
            DB::table('tags')->where('id', $tag->id)->update(['loose_key' => TagName::looseKey($tag->name)]);
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropColumn('loose_key');
        });
    }
};
