<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Um artigo salvo nos favoritos de alguém (RF-159 a RF-162, D89). A chave
 * composta impede salvar duas vezes; a lista é privada, só a contagem é
 * pública.
 *
 * @property int $article_id
 * @property int $user_id
 * @property Carbon $created_at
 * @property-read Article $article
 */
class Favorite extends Model
{
    public const UPDATED_AT = null;

    /** Chave composta no banco; aqui só se conta e se grava por consulta. */
    public $incrementing = false;

    /** @var list<string> */
    protected $guarded = [];

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        // O artigo na lixeira continua na lista, como indisponível
        return $this->belongsTo(Article::class)->withTrashed();
    }
}
