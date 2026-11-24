<?php

namespace App\Domain\Notifications\Actions;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Curtidas viram um aviso só por item enquanto ele não foi lido ("5
 * pessoas curtiram seu artigo", RF-184). Depois de lido, a próxima curtida
 * abre um aviso novo. Quem curtiu não aparece (RF-151): os ids servem só
 * para não contar a mesma pessoa duas vezes.
 */
class GroupLike
{
    public const TYPE = 'like.received';

    /** @param  'article'|'comment'  $target */
    public function handle(User $recipient, User $liker, string $target, int $targetId, string $title, string $url): void
    {
        DB::transaction(function () use ($recipient, $liker, $target, $targetId, $title, $url) {
            // Trava a conta para duas curtidas ao mesmo tempo não abrirem dois avisos
            User::query()->whereKey($recipient->id)->lockForUpdate()->first();

            /** @var Notification|null $open */
            $open = $recipient->notifications()
                ->where('type', self::TYPE)
                ->whereNull('read_at')
                ->where('data->target', $target)
                ->where('data->targetId', $targetId)
                ->first();

            if ($open === null) {
                $recipient->notifications()->create([
                    'id' => (string) Str::uuid(),
                    'type' => self::TYPE,
                    'data' => ['target' => $target, 'targetId' => $targetId, 'title' => $title, 'url' => $url, 'likers' => [$liker->id]],
                ]);

                return;
            }

            /** @var array{likers: list<int>} $data */
            $data = $open->data;
            if (in_array($liker->id, $data['likers'], true)) {
                return;
            }

            $data['likers'][] = $liker->id;
            $open->forceFill(['data' => $data])->save();
        });
    }
}
