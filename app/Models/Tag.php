<?php

namespace App\Models;

use Database\Factories\TagFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
