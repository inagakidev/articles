<?php

namespace App\Models;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Queries\WorkingVersion;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Rules\AuditLabel;
use Carbon\CarbonInterface;
use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
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
 * @property string|null $slug
 * @property int|null $current_version_id
 * @property Carbon|null $first_published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['user_id'])]
class Article extends Model
{
    /** @use HasFactory<ArticleFactory> */
    use HasFactory, Prunable, SoftDeletes;

    /** Dias na lixeira antes da exclusão definitiva (RF-118, RF-119). */
    public const TRASH_DAYS = 7;

    /** @var array<string, mixed> */
    protected $attributes = [
        'state' => 'unpublished',
    ];

    protected static function booted(): void
    {
        // O banco apaga as linhas das imagens junto com o artigo, mas não os
        // arquivos: apagando pelo modelo, cada imagem leva os dela.
        static::forceDeleting(fn (Article $article) => $article->images()->each(fn (ArticleImage $image) => $image->delete()));
    }

    /**
     * Na lixeira há mais de sete dias: sai de vez pelo `model:prune` diário
     * (RF-119, RF-342), com os arquivos das imagens.
     *
     * @return Builder<static>
     */
    public function prunable(): Builder
    {
        return static::query()->onlyTrashed()->where('deleted_at', '<', now()->subDays(self::TRASH_DAYS));
    }

    /**
     * Antes de a rotina apagar, registra na auditoria, sem o conteúdo e sem
     * ninguém como responsável (RF-293, D87).
     */
    protected function pruning(): void
    {
        $title = app(WorkingVersion::class)->for($this)?->title;

        app(RecordAudit::class)->handle(null, AuditAction::ArticleTrashExpired, AuditLabel::article($this, $title), $this);
    }

    /** Até quando a restauração vale (RF-118). */
    public function restorableUntil(): ?CarbonInterface
    {
        return $this->deleted_at?->copy()->addDays(self::TRASH_DAYS);
    }

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

    /** @return HasMany<ArticleImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ArticleImage::class);
    }

    /** @return HasMany<Comment, $this> */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /** @return HasMany<ArticleLike, $this> */
    public function likes(): HasMany
    {
        return $this->hasMany(ArticleLike::class);
    }

    /** @return HasMany<Favorite, $this> */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
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
