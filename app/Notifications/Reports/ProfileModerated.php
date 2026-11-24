<?php

namespace App\Notifications\Reports;

use Illuminate\Notifications\Notification;

/** O perfil foi moderado: foto, bio ou username (RF-187, D91). Só no site. */
class ProfileModerated extends Notification
{
    public function __construct(
        public readonly bool $photo,
        public readonly bool $bio,
        public readonly bool $username,
        public readonly string $policyItem,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function databaseType(object $notifiable): string
    {
        return 'profile.moderated';
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'photo' => $this->photo,
            'bio' => $this->bio,
            'username' => $this->username,
            'policyItem' => $this->policyItem,
            // Com username inadequado, a troca vem antes de qualquer outra página
            'url' => route($this->username ? 'username.required' : 'profile.edit', absolute: false),
        ];
    }
}
