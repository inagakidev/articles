<?php

namespace Database\Factories;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Article> */
class ArticleFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['user_id' => User::factory()];
    }

    /** Artigo publicado, com uma versão aprovada em vigor. */
    public function published(): static
    {
        return $this->afterCreating(function (Article $article) {
            $version = ArticleVersion::factory()->for($article)->create([
                'status' => VersionStatus::Approved,
                'decided_at' => now(),
            ]);

            $article->forceFill([
                'state' => ArticleState::Published,
                'current_version_id' => $version->id,
                'first_published_at' => now(),
            ])->save();
        });
    }
}
