<?php

namespace App\Models;

use App\Domain\Articles\Enums\ArticleState;
use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * O artigo, independente das versões (REQUIREMENTS §5, D79). Estado e
 * versão em vigor só mudam pelas ações do domínio, nunca em massa.
 *
 * @property int $id
 * @property int|null $user_id
 * @property ArticleState $state
 * @property int|null $current_version_id
 * @property Carbon|null $first_published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class Article extends Model
{
    /** @use HasFactory<ArticleFactory> */
    use HasFactory, SoftDeletes;

    /** @var array<string, mixed> */
    protected $attributes = [
        'state' => 'unpublished',
    ];

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return HasMany<ArticleVersion, $this> */
    public function versions(): HasMany
    {
        return $this->hasMany(ArticleVersion::class);
    }

    /** @return BelongsTo<ArticleVersion, $this> */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ArticleVersion::class, 'current_version_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'state' => ArticleState::class,
            'first_published_at' => 'datetime',
        ];
    }
}
