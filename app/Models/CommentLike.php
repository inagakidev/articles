<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Uma curtida num comentário (RF-153 a RF-156, D88). A chave composta impede
 * curtir duas vezes; quem curtiu é privado, só a contagem é pública.
 *
 * @property int $comment_id
 * @property int $user_id
 * @property Carbon $created_at
 */
class CommentLike extends Model
{
    public const UPDATED_AT = null;

    /** Chave composta no banco; aqui só se conta e se grava por consulta. */
    public $incrementing = false;

    /** @var list<string> */
    protected $guarded = [];

    /** @return BelongsTo<Comment, $this> */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}
