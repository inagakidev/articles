<?php

namespace Database\Factories;

use App\Domain\Taxonomy\Enums\CategoryColor;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Category> */
class CategoryFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->word().' '.fake()->word());

        return [
            'slug' => Str::slug($name),
            'name_pt_br' => $name,
            'name_en' => $name.' EN',
            'color' => fake()->randomElement(CategoryColor::cases()),
        ];
    }
}
