<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Comment> */
class CommentFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'article_id' => Article::factory()->published(),
            'user_id' => User::factory(),
            'depth' => 1,
            'body' => fake()->sentence(12),
        ];
    }

    /** Resposta a outro comentário, um nível abaixo. */
    public function replyTo(Comment $parent): static
    {
        return $this->state([
            'article_id' => $parent->article_id,
            'parent_id' => $parent->id,
            'depth' => $parent->depth + 1,
        ]);
    }
}
