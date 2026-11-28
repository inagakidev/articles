<?php

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Busca: filtros, termos curtos e o que a página recebe (RF-131 a RF-136,
 * D85). A busca por texto com o índice FULLTEXT fica em tests/Search.
 */

function inVersion(Article $article, array $attributes): Article
{
    ArticleVersion::query()->whereKey($article->current_version_id)->update($attributes);

    return $article->fresh();
}

function tagged(Article $article, string $name): Article
{
    $tag = Tag::query()->firstOrCreate(['name' => $name], ['loose_key' => $name]);
    $article->currentVersion->tags()->attach($tag);

    return $article;
}

/** @return list<string> */
function searchUrls(array $params): array
{
    $urls = [];

    test()->get(route('search', $params))->assertInertia(function (Assert $page) use (&$urls) {
        $urls = collect($page->toArray()['props']['results']['data'])->pluck('url')->all();
    });

    return $urls;
}

test('sem termo, lista os visíveis, do mais novo para o mais antigo', function () {
    $old = Article::factory()->published()->create();
    $old->forceFill(['first_published_at' => now()->subDays(5)])->save();
    $new = Article::factory()->published()->create();
    Article::factory()->create();

    expect(searchUrls([]))->toBe(['/artigos/'.$new->slug, '/artigos/'.$old->slug])
        ->and(searchUrls(['ordem' => 'antigos']))->toBe(['/artigos/'.$old->slug, '/artigos/'.$new->slug]);
});

test('filtra por categoria, idioma, autor, tags e período', function () {
    $category = Category::factory()->create();
    $match = inVersion(Article::factory()->published()->create([
        'user_id' => User::factory()->create(['name' => 'Xandrielle Moreira', 'username' => 'xandrielle'])->id,
    ]), ['category_id' => $category->id, 'language' => 'en']);
    tagged(tagged($match, 'laravel'), 'php');
    // Categoria fixa: a factory sorteia, e poderia cair na mesma do teste
    tagged(inVersion(Article::factory()->published()->create(), ['category_id' => Category::factory()->create()->id]), 'laravel');
    $old = inVersion(Article::factory()->published()->create(), ['category_id' => $category->id]);
    $old->forceFill(['first_published_at' => now()->subMonths(2)])->save();

    $url = '/artigos/'.$match->slug;

    expect(searchUrls(['categoria' => $category->slug]))->toEqualCanonicalizing([$url, '/artigos/'.$old->slug])
        ->and(searchUrls(['idioma' => 'en']))->toBe([$url])
        ->and(searchUrls(['autor' => 'xandrielle mor']))->toBe([$url])
        ->and(searchUrls(['autor' => '@xandrielle']))->toBe([$url])
        ->and(searchUrls(['tags' => ['laravel', 'PHP']]))->toBe([$url])
        ->and(searchUrls(['categoria' => $category->slug, 'periodo' => 'mes']))->toBe([$url]);
});

test('termo curto acha a palavra inteira no título, a categoria e a tag (D85)', function () {
    $title = inVersion(Article::factory()->published()->create(), ['title' => 'Concorrência em Go, do zero']);
    $tag = tagged(Article::factory()->published()->create(), 'go');
    inVersion(Article::factory()->published()->create(), ['title' => 'Algoritmos de ordenação']);

    expect(searchUrls(['q' => 'go']))->toEqualCanonicalizing(['/artigos/'.$title->slug, '/artigos/'.$tag->slug]);

    $this->get(route('search', ['q' => 'go']))
        ->assertInertia(fn (Assert $page) => $page->where('shortTerms', true));
});

test('termo curto com sinais, como C#, acha a tag', function () {
    $tag = tagged(Article::factory()->published()->create(), 'c#');

    expect(searchUrls(['q' => 'C#']))->toBe(['/artigos/'.$tag->slug]);
});

test('a página recebe os filtros de volta, as opções e quantos estão ligados', function () {
    $category = Category::factory()->create();
    tagged(Article::factory()->published()->create(), 'laravel');
    Tag::query()->create(['name' => 'sem-uso', 'loose_key' => 'semuso']);

    $this->get(route('search', [
        'categoria' => $category->slug, 'tags' => ['Laravel'], 'periodo' => 'ano', 'ordem' => 'antigos',
    ]))->assertInertia(fn (Assert $page) => $page
        ->component('search/index')
        ->where('query.categoria', $category->slug)
        ->where('query.tags', ['laravel'])
        ->where('query.periodo', 'ano')
        ->where('query.ordem', 'antigos')
        ->where('filterCount', 3)
        ->where('shortTerms', false)
        ->where('options.languages', ['pt_BR', 'en'])
        // Só as tags dos artigos visíveis
        ->where('options.tags', ['laravel'])
        ->where('category', $category->name()),
    );
});

test('o que não faz sentido no endereço é ignorado, sem erro', function () {
    Article::factory()->published()->create();

    $this->get(route('search', [
        'idioma' => 'klingon', 'periodo' => 'seculo', 'ordem' => 'curtidas', 'tags' => [['aninhada'], '   '], 'q' => ['x'],
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('query.idioma', null)
        ->where('query.periodo', null)
        ->where('query.ordem', 'curtidos')
        ->where('query.q', '')
        ->where('query.tags', [])
        ->has('results.data', 1),
    );
});

test('sem resultado, sugere os mais recentes da categoria', function () {
    $category = Category::factory()->create();
    $inCategory = inVersion(Article::factory()->published()->create(), ['category_id' => $category->id]);
    inVersion(Article::factory()->published()->create(), ['category_id' => Category::factory()->create()->id]);

    $this->get(route('search', ['categoria' => $category->slug, 'tags' => ['nada']]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('results.total', 0)
            ->has('suggested', 1)
            ->where('suggested.0.url', '/artigos/'.$inCategory->slug),
        );
});

test('com resultado, não sugere nada', function () {
    Article::factory()->published()->create();

    $this->get(route('search'))->assertInertia(fn (Assert $page) => $page->where('suggested', []));
});

test('mais curtidos é a ordem padrão, contando as curtidas do período (RF-132, RF-134)', function () {
    $quiet = Article::factory()->published()->create();
    $recentLikes = Article::factory()->published()->create();
    $oldLikes = Article::factory()->published()->create();
    $like = fn (Article $article, int $daysAgo) => ArticleLike::query()->insert([
        'article_id' => $article->id, 'user_id' => User::factory()->create()->id, 'created_at' => now()->subDays($daysAgo),
    ]);
    $like($recentLikes, 2);
    foreach (range(1, 3) as $i) {
        $like($oldLikes, 60);
    }

    expect(searchUrls([]))->toBe(['/artigos/'.$recentLikes->slug, '/artigos/'.$oldLikes->slug, '/artigos/'.$quiet->slug])
        ->and(searchUrls(['popularidade' => 'sempre']))->toBe(['/artigos/'.$oldLikes->slug, '/artigos/'.$recentLikes->slug, '/artigos/'.$quiet->slug])
        ->and(searchUrls(['popularidade' => '7'])[0])->toBe('/artigos/'.$recentLikes->slug);

    $this->get(route('search', ['popularidade' => 'sempre']))
        ->assertInertia(fn (Assert $page) => $page->where('query.ordem', 'curtidos')->where('query.popularidade', 'sempre'));
});
