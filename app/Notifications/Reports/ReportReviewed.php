<?php

namespace App\Notifications\Reports;

use Illuminate\Notifications\Notification;

/**
 * A denúncia foi analisada (RF-172, RF-186): só o aviso, nunca o
 * desfecho. Só no site.
 */
class ReportReviewed extends Notification
{
    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function databaseType(object $notifiable): string
    {
        return 'report.reviewed';
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
