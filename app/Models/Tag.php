<?php

namespace App\Models;

use App\Domain\Taxonomy\Rules\TagName;
use Database\Factories\TagFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * Tag livre, já normalizada (RF-127, RF-128). Bloqueada, não pode ser usada
 * (RF-129); unida a outra, vira apelido dela.
 *
 * @property int $id
 * @property string $name
 * @property string $loose_key
 * @property Carbon|null $blocked_at
 * @property int|null $merged_into_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name'])]
class Tag extends Model
{
    /** @use HasFactory<TagFactory> */
    use HasFactory;

    /**
     * Guardar o nome guarda também a chave aproximada das sugestões (D79).
     *
     * @return Attribute<string, string>
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => ['name' => $value, 'loose_key' => TagName::looseKey($value)],
        );
    }

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }

    /** @return BelongsToMany<ArticleVersion, $this> */
    public function versions(): BelongsToMany
    {
        return $this->belongsToMany(ArticleVersion::class);
    }

    /** @return BelongsTo<Tag, $this> */
    public function mergedInto(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'merged_into_id');
    }

    /**
     * Tags de verdade: as que não foram unidas a outra.
     *
     * @param  Builder<static>  $query
     */
    public function scopeCanonical(Builder $query): void
    {
        $query->whereNull('merged_into_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['blocked_at' => 'datetime'];
    }
}
