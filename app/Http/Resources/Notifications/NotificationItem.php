<?php

namespace App\Http\Resources\Notifications;

use App\Models\Notification;

/**
 * Uma notificação para a tela: o tipo e os dados do texto, que o frontend
 * monta no idioma de quem lê. Das curtidas sai só a quantidade, nunca quem
 * curtiu (RF-151).
 */
class NotificationItem
{
    /** @return array<string, mixed> */
    public static function from(Notification $notification): array
    {
        /** @var array<string, mixed> $data */
        $data = $notification->data;

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'read' => $notification->read_at !== null,
            'at' => $notification->updated_at?->toIso8601String(),
            // Abrir leva ao destino e marca como lida
            'href' => route('notifications.open', $notification->id, absolute: false),
            'title' => $data['title'] ?? null,
            'edit' => $data['edit'] ?? false,
            'policyItem' => $data['policyItem'] ?? null,
            'actor' => $data['actor'] ?? null,
            'excerpt' => $data['excerpt'] ?? null,
            'target' => $data['target'] ?? null,
            // Perfil moderado: o que foi redefinido (RF-187)
            'parts' => array_keys(array_filter([
                'photo' => $data['photo'] ?? false,
                'bio' => $data['bio'] ?? false,
                'username' => $data['username'] ?? false,
            ])),
            'count' => isset($data['likers']) && is_array($data['likers']) ? count($data['likers']) : null,
        ];
    }
}
