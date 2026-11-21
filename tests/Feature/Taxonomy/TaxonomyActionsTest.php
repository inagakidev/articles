<?php

use App\Domain\Taxonomy\Actions\DeleteCategory;
use App\Domain\Taxonomy\Actions\MergeTags;
use App\Domain\Taxonomy\Actions\ResolveTags;
use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Tag;

/*
 * Regras de categorias e tags (RF-124 a RF-129, p4-03).
 */

test('as categorias iniciais existem nos dois idiomas', function () {
    $databases = Category::query()->where('slug', 'banco-de-dados')->sole();

    expect(Category::query()->count())->toBe(10)
        ->and($databases->name('pt_BR'))->toBe('Banco de dados')
        ->and($databases->name('en'))->toBe('Databases');
});

test('excluir transfere todas as versões, de todos os artigos, para a categoria escolhida', function () {
    [$from, $to] = Category::factory()->count(2)->create();
    $article = Article::factory()->create();
    ArticleVersion::factory()->for($article)->create(['category_id' => $from->id, 'status' => 'approved']);
    ArticleVersion::factory()->for($article)->create(['category_id' => $from->id]);
    ArticleVersion::factory()->create(['category_id' => $from->id]);

    app(DeleteCategory::class)->handle($from, $to);

    expect(Category::query()->find($from->id))->toBeNull()
        ->and(ArticleVersion::query()->where('category_id', $to->id)->count())->toBe(3);
});

test('sem destino, a categoria em uso não é excluída', function () {
    $category = Category::factory()->create();
    ArticleVersion::factory()->create(['category_id' => $category->id]);

    expect(fn () => app(DeleteCategory::class)->handle($category))->toThrow(TaxonomyRefused::class);
    expect($category->fresh())->not->toBeNull();
});

test('categoria sem uso é excluída sem destino; transferir para ela mesma é recusado', function () {
    $category = Category::factory()->create();

    expect(fn () => app(DeleteCategory::class)->handle($category, $category))->toThrow(TaxonomyRefused::class);

    app(DeleteCategory::class)->handle($category);

    expect($category->fresh())->toBeNull();
});

test('unir leva as versões para a tag certa, sem duplicar, e a antiga vira apelido', function () {
    $react = Tag::factory()->create(['name' => 'react']);
    $reactjs = Tag::factory()->create(['name' => 'reactjs']);
    $alias = Tag::factory()->create(['name' => 'react-js', 'merged_into_id' => $reactjs->id]);
    $both = ArticleVersion::factory()->create();
    $both->tags()->attach([$react->id, $reactjs->id]);
    $onlyOld = ArticleVersion::factory()->create();
    $onlyOld->tags()->attach($reactjs->id);

    app(MergeTags::class)->handle($reactjs, $react);

    expect($both->tags()->pluck('name')->all())->toBe(['react'])
        ->and($onlyOld->tags()->pluck('name')->all())->toBe(['react'])
        ->and($reactjs->fresh()->merged_into_id)->toBe($react->id)
        ->and($alias->fresh()->merged_into_id)->toBe($react->id);
});

test('não une uma tag a ela mesma nem a um apelido', function () {
    $tag = Tag::factory()->create();
    $alias = Tag::factory()->create(['merged_into_id' => $tag->id]);
    $other = Tag::factory()->create();

    expect(fn () => app(MergeTags::class)->handle($tag, $tag))->toThrow(TaxonomyRefused::class)
        ->and(fn () => app(MergeTags::class)->handle($other, $alias))->toThrow(TaxonomyRefused::class);
});

test('o que o autor digita vira tags normalizadas, sem repetir, seguindo os apelidos', function () {
    $react = Tag::factory()->create(['name' => 'react']);
    Tag::factory()->create(['name' => 'reactjs', 'merged_into_id' => $react->id]);

    $tags = app(ResolveTags::class)->handle(['React', 'ReactJS', ' react ', 'Programação Funcional', '', '🚀']);

    expect($tags->pluck('name')->all())->toBe(['react', 'programacao-funcional'])
        ->and(Tag::query()->where('name', 'programacao-funcional')->exists())->toBeTrue();
});

test('tag bloqueada é recusada', function () {
    Tag::factory()->blocked()->create(['name' => 'ganhe-dinheiro']);

    expect(fn () => app(ResolveTags::class)->handle(['Ganhe Dinheiro']))->toThrow(TaxonomyRefused::class);
});
