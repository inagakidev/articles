<?php

namespace App\Models;

use App\Domain\Articles\Enums\VersionStatus;
use Database\Factories\ArticleVersionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * Uma cópia completa do conteúdo do artigo, com o próprio estado (D79).
 * Só o rascunho aceita mudanças; o status muda pelas ações do domínio.
 *
 * @property int $id
 * @property int $article_id
 * @property VersionStatus $status
 * @property string|null $title
 * @property array<string, mixed>|null $content
 * @property string|null $content_text
 * @property string|null $language
 * @property int|null $category_id
 * @property int|null $cover_image_id
 * @property string|null $cover_alt
 * @property bool $cover_decorative
 * @property int|null $based_on_id
 * @property Carbon|null $submitted_at
 * @property Carbon|null $decided_at
 * @property int|null $decided_by_id
 * @property string|null $decision_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'content', 'content_text', 'language', 'category_id', 'cover_image_id', 'cover_alt', 'cover_decorative'])]
class ArticleVersion extends Model
{
    /** @use HasFactory<ArticleVersionFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'draft',
        'cover_decorative' => false,
    ];

    /** Colunas geradas pelo banco para os limites de RF-351; nunca escritas. */
    protected $hidden = ['draft_slot', 'pending_slot', 'approved_slot'];

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class)->withTrashed();
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsToMany<Tag, $this> */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /** @return BelongsTo<ArticleImage, $this> */
    public function coverImage(): BelongsTo
    {
        return $this->belongsTo(ArticleImage::class, 'cover_image_id');
    }

    /**
     * Imagens citadas pela versão, no texto ou na capa (RF-089).
     *
     * @return BelongsToMany<ArticleImage, $this>
     */
    public function images(): BelongsToMany
    {
        return $this->belongsToMany(ArticleImage::class, 'article_version_image');
    }

    /** @return BelongsTo<ArticleVersion, $this> */
    public function basedOn(): BelongsTo
    {
        return $this->belongsTo(ArticleVersion::class, 'based_on_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => VersionStatus::class,
            'content' => 'array',
            'cover_decorative' => 'boolean',
            'submitted_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }
}
