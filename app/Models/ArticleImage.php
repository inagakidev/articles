<?php

namespace App\Models;

use App\Support\Media\MediaDelivery;
use Database\Factories\ArticleImageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * Uma imagem enviada para um artigo (D52, D81). As versões só a citam.
 * Sem nenhuma versão que a use por 24 horas, é apagada pelo `model:prune`
 * (REQUIREMENTS §7); apagar o registro apaga os arquivos.
 *
 * @property int $id
 * @property string $uuid
 * @property int $article_id
 * @property int|null $user_id
 * @property int $width
 * @property int $height
 * @property int $size
 * @property list<int>|null $variants
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ArticleImage extends Model
{
    /** @use HasFactory<ArticleImageFactory> */
    use HasFactory, Prunable;

    /** Larguras derivadas, em WebP (RF-084). */
    public const WIDTHS = [480, 960, 1600];

    /** Tempo que uma imagem enviada espera ser usada por uma versão. */
    public const UNUSED_HOURS = 24;

    protected static function booted(): void
    {
        static::deleted(fn (ArticleImage $image) => app(MediaDelivery::class)->disk()->deleteDirectory($image->directory()));
    }

    /**
     * Enviada há mais de 24 horas e sem versão que a cite, no texto ou na
     * capa: a pessoa removeu ou nunca chegou a usar.
     *
     * @return Builder<static>
     */
    public function prunable(): Builder
    {
        return static::query()
            ->whereDoesntHave('versions')
            ->where('created_at', '<', now()->subHours(self::UNUSED_HOURS));
    }

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class)->withTrashed();
    }

    /** @return BelongsToMany<ArticleVersion, $this> */
    public function versions(): BelongsToMany
    {
        return $this->belongsToMany(ArticleVersion::class, 'article_version_image');
    }

    public function directory(): string
    {
        return 'images/'.$this->uuid;
    }

    /** Caminho no disco de mídia: o original tratado ou uma largura derivada. */
    public function path(?int $width = null): string
    {
        return $this->directory().'/'.($width ?? 'original').'.webp';
    }

    /** A largura pedida, se já foi gerada; senão, o original. */
    public function pathFor(?int $width): string
    {
        return $width !== null && in_array($width, $this->variants ?? [], true)
            ? $this->path($width)
            : $this->path();
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'variants' => 'array',
        ];
    }
}
