<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Versões dos Termos de uso e da Política de privacidade e o aceite de
     * cada pessoa (RF-013, D72). O texto de cada versão fica em
     * resources/policies, revisado junto com o código.
     */
    public function up(): void
    {
        Schema::create('policy_versions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20);
            $table->string('version', 20);
            $table->timestamp('published_at');

            $table->unique(['type', 'version']);
        });

        Schema::create('policy_acceptances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('policy_version_id')->constrained()->restrictOnDelete();
            $table->timestamp('accepted_at');

            $table->unique(['user_id', 'policy_version_id']);
        });

        // Versão inicial, provisória até os textos finais (D72).
        DB::table('policy_versions')->insert([
            ['type' => 'terms', 'version' => '2026-11-draft', 'published_at' => now()],
            ['type' => 'privacy', 'version' => '2026-11-draft', 'published_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_acceptances');
        Schema::dropIfExists('policy_versions');
    }
};
