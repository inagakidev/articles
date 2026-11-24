<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Uma notificação dentro do site (RF-179 a RF-192, D90). O `type` diz o
 * que aconteceu (`article.approved`, `comment.posted`, `like.received`…) e
 * `data` guarda só o necessário para montar o texto no idioma de quem lê.
 */
class Notification extends DatabaseNotification
{
    use MassPrunable;

    /** Retenção (RF-191). */
    public const RETENTION_DAYS = 90;

    /**
     * Apagadas pelo `model:prune` diário depois de 90 dias sem novidade;
     * uma curtida nova renova o aviso agrupado.
     *
     * @return Builder<static>
     */
    public function prunable(): Builder
    {
        return static::query()->where('updated_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
