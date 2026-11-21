<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ArticleVersion> */
class ArticleVersionFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $text = fake()->paragraphs(3, true);

        return [
            'article_id' => Article::factory(),
            'title' => fake()->sentence(6),
            'content' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $text]]]]],
            'content_text' => $text,
            'language' => 'pt_BR',
            'category_id' => fn () => Category::query()->inRandomOrder()->value('id') ?? Category::factory(),
        ];
    }
}
