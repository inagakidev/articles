<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\User;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use Database\Seeders\DemoArticlesSeeder;

test('publica os seis artigos de demonstração da autora de exemplo', function () {
    $this->seed(DemoArticlesSeeder::class);

    $author = User::query()->where('email', DemoArticlesSeeder::AUTHOR_EMAIL)->sole();
    $articles = Article::query()->with('currentVersion.tags', 'currentVersion.category')->get();

    expect($articles)->toHaveCount(6)
        ->each(fn ($article) => $article
            ->user_id->toBe($author->id)
            ->state->toBe(ArticleState::Published)
            ->first_published_at->not->toBeNull());

    foreach ($articles as $article) {
        $version = $article->currentVersion;

        expect($version->status)->toBe(VersionStatus::Approved)
            ->and($version->category)->not->toBeNull()
            ->and($version->tags)->not->toBeEmpty()
            ->and($version->content_text)->not->toBeEmpty();
    }
});

test('o conteúdo usa só o que o editor aceita e cabe no limite', function () {
    $sanitizer = new DocumentSanitizer;
    $renderer = app(ArticleRenderer::class);

    foreach (require database_path('seeders/Demo/articles.php') as $data) {
        expect($sanitizer->sanitize($data['content']))->toBe($data['content'])
            ->and($renderer->render($data['content'])->characters)->toBeLessThanOrEqual(50_000);
    }
});

test('rodar de novo não duplica', function () {
    $this->seed(DemoArticlesSeeder::class);
    $this->seed(DemoArticlesSeeder::class);

    expect(Article::query()->count())->toBe(6)
        ->and(User::query()->where('email', DemoArticlesSeeder::AUTHOR_EMAIL)->count())->toBe(1);
});

test('não roda em produção', function () {
    app()->detectEnvironment(fn () => 'production');

    $this->seed(DemoArticlesSeeder::class);

    expect(Article::query()->count())->toBe(0)
        ->and(User::query()->where('email', DemoArticlesSeeder::AUTHOR_EMAIL)->exists())->toBeFalse();
});
