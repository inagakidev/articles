<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Categorias fixas, administradas pela administradora (RF-124), com nome nos
 * dois idiomas e um pastel; e tags livres, normalizadas (RF-127 a RF-129).
 * As categorias iniciais são as da página de apresentação (D79).
 */
return new class extends Migration
{
    private const INITIAL = [
        ['front-end', 'Front-end', 'Front-end', 'lavender'],
        ['back-end', 'Back-end', 'Back-end', 'blue'],
        ['acessibilidade', 'Acessibilidade', 'Accessibility', 'mint'],
        ['banco-de-dados', 'Banco de dados', 'Databases', 'yellow'],
        ['devops', 'DevOps', 'DevOps', 'pink'],
        ['carreira', 'Carreira', 'Career', 'peach'],
        ['mobile', 'Mobile', 'Mobile', 'blue'],
        ['seguranca', 'Segurança', 'Security', 'mint'],
        ['open-source', 'Open source', 'Open source', 'yellow'],
        ['testes', 'Testes', 'Testing', 'lavender'],
    ];

    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 60)->unique();
            $table->string('name_pt_br', 40)->unique();
            $table->string('name_en', 40)->unique();
            $table->string('color', 20);
            $table->timestamps();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            // Já normalizado: minúsculas, sem acento, hífen no lugar de espaço
            $table->string('name', 40)->unique();
            $table->timestamp('blocked_at')->nullable();
            // Tag unida a outra: vira apelido e leva a quem a usar para a outra
            $table->foreignId('merged_into_id')->nullable()->constrained('tags')->nullOnDelete();
            $table->timestamps();
        });

        $now = now();
        DB::table('categories')->insert(array_map(fn (array $category) => [
            'slug' => $category[0],
            'name_pt_br' => $category[1],
            'name_en' => $category[2],
            'color' => $category[3],
            'created_at' => $now,
            'updated_at' => $now,
        ], self::INITIAL));
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
        Schema::dropIfExists('categories');
    }
};
