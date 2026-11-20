<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Versão 1.0 dos textos das pranchas, ainda provisória até a validação
     * jurídica, e a Política de conteúdo, que não tem aceite (D73).
     */
    public function up(): void
    {
        Schema::table('policy_versions', function (Blueprint $table) {
            // Provisória: mostra o selo de rascunho até a validação jurídica (RF-276).
            $table->boolean('draft')->default(false)->after('version');
        });

        DB::table('policy_versions')
            ->where('version', '2026-11-draft')
            ->update(['version' => '1.0', 'draft' => true]);

        DB::table('policy_versions')->insert([
            'type' => 'content',
            'version' => '1.0',
            'draft' => true,
            'published_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('policy_versions')->where('type', 'content')->delete();
        DB::table('policy_versions')
            ->where('version', '1.0')
            ->where('draft', true)
            ->update(['version' => '2026-11-draft']);

        Schema::table('policy_versions', function (Blueprint $table) {
            $table->dropColumn('draft');
        });
    }
};
