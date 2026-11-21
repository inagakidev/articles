<?php

namespace Database\Seeders;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Taxonomy\Actions\ResolveTags;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\User;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Conteúdo de demonstração: seis artigos publicados por uma autora de
 * exemplo, para ver as telas com conteúdo de verdade. Nunca roda em
 * produção. Rodar de novo não duplica nada.
 *
 *     php artisan db:seed --class=DemoArticlesSeeder
 */
class DemoArticlesSeeder extends Seeder
{
    public const AUTHOR_EMAIL = 'lia@exemplo.dev';

    public function run(DocumentSanitizer $sanitizer, ArticleRenderer $renderer, ResolveTags $resolveTags): void
    {
        if (app()->isProduction()) {
            $this->command?->warn('Conteúdo de demonstração não roda em produção.');

            return;
        }

        $author = User::query()->where('email', self::AUTHOR_EMAIL)->first() ?? User::factory()->create([
            'name' => 'Lia Martins',
            'username' => 'lia-martins',
            'email' => self::AUTHOR_EMAIL,
            'bio' => 'Dev back-end, escreve sobre PHP, testes e o que aprende no caminho.',
        ]);

        /** @var list<array{title: string, category: string, tags: list<string>, content: array<string, mixed>}> $articles */
        $articles = require __DIR__.'/Demo/articles.php';

        foreach ($articles as $index => $data) {
            $exists = ArticleVersion::query()
                ->where('title', $data['title'])
                ->whereHas('article', fn ($query) => $query->where('user_id', $author->id))
                ->exists();

            if ($exists) {
                continue;
            }

            // Datas espaçadas, do mais antigo ao mais novo.
            $publishedAt = now()->subDays((count($articles) - $index) * 3);
            $content = $sanitizer->sanitize($data['content']);

            DB::transaction(function () use ($author, $data, $content, $publishedAt, $renderer, $resolveTags) {
                $article = Article::query()->create(['user_id' => $author->id]);

                $version = new ArticleVersion([
                    'title' => $data['title'],
                    'content' => $content,
                    'content_text' => $renderer->text($content),
                    'language' => 'pt_BR',
                    'category_id' => Category::query()->where('slug', $data['category'])->value('id'),
                ]);
                $version->article()->associate($article);
                $version->forceFill([
                    'status' => VersionStatus::Approved,
                    'submitted_at' => $publishedAt,
                    'decided_at' => $publishedAt,
                    'created_at' => $publishedAt,
                    'updated_at' => $publishedAt,
                ])->save();
                $version->tags()->sync($resolveTags->handle($data['tags'])->pluck('id'));

                $article->forceFill([
                    'state' => ArticleState::Published,
                    'current_version_id' => $version->id,
                    'first_published_at' => $publishedAt,
                    'created_at' => $publishedAt,
                    'updated_at' => $publishedAt,
                ])->save();
            });
        }
    }
}
