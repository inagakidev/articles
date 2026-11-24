<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Busca por texto (RF-130, D54, D85), com o índice FULLTEXT de verdade.
 */

function searchable(string $title, string $text = 'Texto qualquer.', array $article = []): Article
{
    $published = Article::factory()->published()->create($article);
    ArticleVersion::query()->whereKey($published->current_version_id)->update([
        'title' => $title,
        'content_text' => $text,
    ]);

    return $published->fresh();
}

/** @return list<string> */
function found(string $query, array $params = []): array
{
    $urls = [];

    test()->get(route('search', ['q' => $query, ...$params]))
        ->assertOk()
        ->assertInertia(function (Assert $page) use (&$urls) {
            $page->component('search/index');
            $urls = collect($page->toArray()['props']['results']['data'])->pluck('url')->all();
        });

    return $urls;
}

test('acha pelo título e pelo texto, também pelo começo da palavra', function () {
    $title = searchable('Filas no Laravel sem mistério');
    $text = searchable('Workers em produção', 'O job vai para a fila e o worker executa.');
    searchable('Tipos utilitários do TypeScript');

    expect(found('filas'))->toBe(['/artigos/'.$title->slug])
        ->and(found('fila'))->toEqualCanonicalizing(['/artigos/'.$title->slug, '/artigos/'.$text->slug])
        ->and(found('WORKER'))->toBe(['/artigos/'.$text->slug]);
});

test('cada termo precisa aparecer, em qualquer lugar', function () {
    $both = searchable('Filas no Laravel', 'Com Redis e Supervisor.');
    searchable('Filas no Node');

    expect(found('filas redis'))->toBe(['/artigos/'.$both->slug]);
});

test('acha pelo nome do autor, pela categoria e pela tag', function () {
    $byAuthor = searchable('Primeiro', article: ['user_id' => User::factory()->create(['name' => 'Rafaela Moreira'])->id]);
    $byCategory = searchable('Segundo');
    $category = Category::factory()->create(['name_pt_br' => 'Infraestrutura', 'name_en' => 'Infrastructure']);
    ArticleVersion::query()->whereKey($byCategory->current_version_id)->update(['category_id' => $category->id]);
    $byTag = searchable('Terceiro');
    $byTag->currentVersion->tags()->attach(Tag::query()->create(['name' => 'kubernetes', 'loose_key' => 'kubernetes']));

    expect(found('rafaela'))->toBe(['/artigos/'.$byAuthor->slug])
        ->and(found('infraestrutura'))->toBe(['/artigos/'.$byCategory->slug])
        ->and(found('kubernetes'))->toBe(['/artigos/'.$byTag->slug]);
});

test('palavras que não ajudam ficam de fora; as que sobram precisam aparecer', function () {
    $article = searchable('Filas no Laravel');

    expect(found('como usar filas'))->toBe([])
        ->and(found('o que são filas'))->toBe(['/artigos/'.$article->slug]);
});

test('só acha artigos visíveis', function () {
    $visible = searchable('Filas no Laravel');
    searchable('Filas na lixeira')->delete();
    searchable('Filas despublicadas')->forceFill(['state' => ArticleState::Unpublished])->save();
    $draft = Article::factory()->create();
    ArticleVersion::factory()->for($draft)->create(['title' => 'Filas em rascunho']);

    expect(found('filas'))->toBe(['/artigos/'.$visible->slug]);
});

test('o texto combina com os filtros', function () {
    $recent = searchable('Filas no Laravel');
    $old = searchable('Filas antigas');
    $old->forceFill(['first_published_at' => now()->subYears(2)])->save();

    expect(found('filas', ['periodo' => 'ano']))->toBe(['/artigos/'.$recent->slug])
        ->and(found('filas', ['ordem' => 'antigos']))->toBe(['/artigos/'.$old->slug, '/artigos/'.$recent->slug]);
});
