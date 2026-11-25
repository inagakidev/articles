<?php

namespace App\Notifications\Moderation;

use App\Models\Appeal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppealResult extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [60, 300];

    public function __construct(
        public readonly Appeal $appeal,
        public readonly bool $accepted,
    ) {
        $this->afterCommit();
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->accepted ? __('mail.appeal.accepted.subject') : __('mail.appeal.rejected.subject'))
            ->line($this->accepted ? __('mail.appeal.accepted.intro') : __('mail.appeal.rejected.intro'));

        if ($this->appeal->decision_reason) {
            $mail->line(__('mail.appeal.reason', ['reason' => $this->appeal->decision_reason]));
        }

        return $mail;
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->accepted ? 'appeal.accepted' : 'appeal.rejected',
            'appealId' => $this->appeal->id,
            'url' => route('home', absolute: false),
        ];
    }
}
