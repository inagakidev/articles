<?php

namespace App\Models;

use Database\Factories\ArticleImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * Uma imagem enviada para um artigo (D52, D81). As versões só a citam; o
 * arquivo some pela rotina de imagens sem uso (p4-11).
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
    use HasFactory;

    /** Larguras derivadas, em WebP (RF-084). */
    public const WIDTHS = [480, 960, 1600];

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
