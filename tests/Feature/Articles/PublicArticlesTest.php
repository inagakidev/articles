<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Search\Queries\ArticleSearch;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Listagem e leitura públicas (RF-002, RF-133, RF-137, RF-352, RF-379, p5-01
 * a p5-03), sempre pela regra única de visibilidade.
 */

function publishedArticle(array $version = [], array $article = []): Article
{
    $published = Article::factory()->published()->create($article);
    ArticleVersion::query()->whereKey($published->current_version_id)->update($version);

    return $published->fresh();
}

test('a regra única deixa de fora rascunho, lixeira e artigo sem endereço', function () {
    $visible = publishedArticle();
    Article::factory()->create();
    publishedArticle()->delete();
    publishedArticle()->forceFill(['slug' => null])->save();
    publishedArticle()->forceFill(['state' => ArticleState::Unpublished])->save();

    expect(app(PublicArticles::class)->query()->pluck('id')->all())->toBe([$visible->id]);
});

test('a listagem mostra os visíveis, do mais novo para o mais antigo', function () {
    $old = publishedArticle(article: []);
    $old->forceFill(['first_published_at' => now()->subDays(3)])->save();
    $new = publishedArticle();
    Article::factory()->create();

    $this->get(route('articles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles/index')
            ->has('articles.data', 2)
            ->where('articles.data.0.url', '/artigos/'.$new->slug)
            ->where('articles.data.0.title', $new->currentVersion->title)
            ->where('articles.data.1.url', '/artigos/'.$old->slug)
            ->where('articles.total', 2)
            ->where('query.categoria', null)
            ->where('filterCount', 0)
            // O cartão não leva o documento nem dados da conta
            ->missing('articles.data.0.content')
            ->missing('articles.data.0.author.email'),
        );
});

test('a listagem pagina de doze em doze (RF-133)', function () {
    foreach (range(1, ArticleSearch::PER_PAGE + 1) as $day) {
        publishedArticle()->forceFill(['first_published_at' => now()->subDays($day)])->save();
    }

    $this->get(route('articles.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 1)
            ->where('articles.currentPage', 2)
            ->where('articles.lastPage', 2)
            ->where('articles.from', 13)
            ->where('articles.total', 13),
        );
});

test('filtra por categoria e só oferece categorias com artigo', function () {
    [$backend, $empty] = Category::factory()->count(2)->create()->all();
    $inBackend = publishedArticle(['category_id' => $backend->id]);
    publishedArticle(['category_id' => Category::factory()->create()->id]);

    $this->get(route('articles.index', ['categoria' => $backend->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('query.categoria', $backend->slug)
            ->has('articles.data', 1)
            ->where('articles.data.0.url', '/artigos/'.$inBackend->slug)
            ->where('categories', fn ($categories) => collect($categories)->contains('slug', $backend->slug)
                && ! collect($categories)->contains('slug', $empty->slug)),
        );
});

test('categoria que não existe só não acha nada', function () {
    publishedArticle();

    $this->get(route('articles.index', ['categoria' => 'nao-existe']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('articles.total', 0));
});

test('a listagem tem os mesmos filtros e a ordem da busca (D85)', function () {
    $old = publishedArticle();
    $old->forceFill(['first_published_at' => now()->subYears(2)])->save();
    $new = publishedArticle(['language' => 'en']);

    $this->get(route('articles.index', ['ordem' => 'antigos']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('articles.data.0.url', '/artigos/'.$old->slug)
            ->where('query.ordem', 'antigos')
            ->has('options.categories')
            ->where('options.languages', ['pt_BR', 'en']),
        );

    $this->get(route('articles.index', ['idioma' => 'en', 'periodo' => 'ano']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 1)
            ->where('articles.data.0.url', '/artigos/'.$new->slug)
            ->where('filterCount', 2),
        );
});

test('a leitura mostra o artigo, com a data da primeira publicação', function () {
    $article = publishedArticle();
    $article->forceFill(['first_published_at' => '2026-11-12 10:00:00'])->save();
    ArticleVersion::query()->whereKey($article->current_version_id)->update(['decided_at' => '2026-11-12 10:00:00']);

    $this->get(route('articles.show', $article->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles/show')
            ->where('article.title', $article->currentVersion->title)
            ->where('article.publishedAt', '2026-11-12')
            ->where('article.updatedAt', null)
            ->where('article.author.username', $article->author->username)
            ->missing('article.author.email')
            ->has('article.html')
            ->has('article.toc'),
        );
});

test('"atualizado em" aparece quando outra versão foi aprovada depois (RF-137)', function () {
    $article = publishedArticle(['decided_at' => '2026-11-14 09:00:00']);
    $article->forceFill(['first_published_at' => '2026-11-12 10:00:00'])->save();

    $this->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('article.updatedAt', '2026-11-14'));
});

test('artigo fora do ar dá a página 404, sem revelar que existe', function (Closure $hide) {
    $article = publishedArticle();
    $slug = $article->slug;
    $hide($article);

    $this->get(route('articles.show', $slug))
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('errors/not-found'));
})->with([
    'na lixeira' => [fn (Article $article) => $article->delete()],
    'despublicado' => [fn (Article $article) => $article->forceFill(['state' => ArticleState::Unpublished])->save()],
]);

test('o rascunho de um artigo publicado não aparece na leitura', function () {
    $article = publishedArticle();
    ArticleVersion::factory()->for($article)->create(['status' => VersionStatus::Draft, 'title' => 'Ainda escrevendo']);

    $this->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('article.title', $article->currentVersion->title));
});

test('artigo de conta excluída continua no ar com o autor removido (RF-051)', function () {
    $article = publishedArticle();
    $article->forceFill(['user_id' => null])->save();

    $this->withHeader('Accept-Language', 'pt-BR')
        ->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('article.author.name', 'Autor removido')
            ->where('article.author.username', null),
        );

    $this->get(route('articles.index'))
        ->assertInertia(fn (Assert $page) => $page->where('articles.data.0.author.avatar', null));
});

test('endereço que não existe dá a página 404 do site', function () {
    $this->get('/nada-por-aqui')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('errors/not-found'));
});

test('pedido em JSON e imagem continuam com o 404 curto', function () {
    $this->getJson(route('articles.show', 'nao-existe'))
        ->assertNotFound()
        ->assertJsonStructure(['message']);

    $this->get('/media/articles/nao-existe.webp')
        ->assertNotFound()
        ->assertHeaderMissing('X-Inertia');
    expect($this->get('/media/articles/nao-existe.webp')->getContent())->not->toContain('errors/not-found');
});

test('a apresentação mostra os artigos recentes e quem publicou no mês (RF-381, RF-382)', function () {
    $author = User::factory()->create(['name' => 'Rafa Moreira']);
    $article = publishedArticle(article: ['user_id' => $author->id]);
    $article->forceFill(['first_published_at' => now()])->save();
    publishedArticle()->forceFill(['first_published_at' => now()->subMonths(2)])->save();
    Article::factory()->for($author, 'author')->create();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('recentArticles', 2)
            ->where('recentArticles.0.url', '/artigos/'.$article->slug)
            ->where('authors.count', 1)
            ->where('authors.people.0.name', 'Rafa Moreira')
            ->missing('authors.people.0.email'),
        );
});
