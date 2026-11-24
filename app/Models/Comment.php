<?php

namespace App\Models;

use Database\Factories\CommentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Um comentário ou resposta num artigo (RF-138 a RF-147, D88). As regras
 * de escrever, editar e apagar ficam nas ações de `Domain/Interactions`.
 *
 * @property int $id
 * @property int $article_id
 * @property int $user_id
 * @property int|null $parent_id
 * @property int $depth
 * @property string $body
 * @property Carbon|null $edited_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Comment extends Model
{
    /** @use HasFactory<CommentFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $guarded = ['id'];

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return BelongsTo<Comment, $this> */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /** @return HasMany<Comment, $this> */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    /** @return HasMany<CommentLike, $this> */
    public function likes(): HasMany
    {
        return $this->hasMany(CommentLike::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['edited_at' => 'datetime'];
    }
}
