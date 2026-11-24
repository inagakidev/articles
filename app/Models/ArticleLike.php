<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Uma curtida num artigo (RF-148 a RF-152, D88). A chave composta impede
 * curtir duas vezes; quem curtiu é privado, só a contagem é pública.
 *
 * @property int $article_id
 * @property int $user_id
 * @property Carbon $created_at
 */
class ArticleLike extends Model
{
    public const UPDATED_AT = null;

    /** Chave composta no banco; aqui só se conta e se grava por consulta. */
    public $incrementing = false;

    /** @var list<string> */
    protected $guarded = [];

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
