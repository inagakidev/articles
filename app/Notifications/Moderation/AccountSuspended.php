<?php

namespace App\Notifications\Moderation;

use App\Models\Penalty;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class AccountSuspended extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300];

    public function __construct(public readonly Penalty $penalty)
    {
        $this->afterCommit();
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = URL::temporarySignedRoute(
            'penalty.appeal',
            $this->penalty->appeal_deadline_at ?? now()->addDays(7),
            ['penalty' => $this->penalty->id],
        );

        return (new MailMessage)
            ->subject(__('mail.penalty.suspended.subject'))
            ->line(__('mail.penalty.suspended.intro'))
            ->line(__('mail.penalty.policy', ['item' => $this->penalty->policy_item]))
            ->line(__('mail.penalty.reason', ['reason' => $this->penalty->reason]))
            ->action(__('mail.penalty.contest'), $url);
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'account.suspended',
            'penaltyId' => $this->penalty->id,
            'url' => route('penalty.suspended', absolute: false),
        ];
    }
}
