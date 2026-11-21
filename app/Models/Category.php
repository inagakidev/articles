<?php

namespace App\Models;

use App\Domain\Taxonomy\Enums\CategoryColor;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Categoria principal do artigo (RF-124, RF-125), com nome nos dois idiomas.
 *
 * @property int $id
 * @property string $slug
 * @property string $name_pt_br
 * @property string $name_en
 * @property CategoryColor $color
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['slug', 'name_pt_br', 'name_en', 'color'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    /** Nome no idioma da página. */
    public function name(?string $locale = null): string
    {
        return ($locale ?? app()->getLocale()) === 'en' ? $this->name_en : $this->name_pt_br;
    }

    /** @return HasMany<ArticleVersion, $this> */
    public function versions(): HasMany
    {
        return $this->hasMany(ArticleVersion::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['color' => CategoryColor::class];
    }
}
