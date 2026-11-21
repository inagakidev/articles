<?php

namespace Database\Factories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Tag> */
class TagFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['name' => fake()->unique()->regexify('[a-z]{4,10}')];
    }

    public function blocked(): static
    {
        return $this->state(fn () => ['blocked_at' => now()]);
    }
}
