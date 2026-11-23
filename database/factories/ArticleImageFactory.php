<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\ArticleImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ArticleImage> */
class ArticleImageFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'article_id' => Article::factory(),
            'user_id' => fn (array $attributes) => Article::query()->whereKey($attributes['article_id'])->value('user_id'),
            'width' => 1600,
            'height' => 900,
            'size' => 120_000,
        ];
    }
}
