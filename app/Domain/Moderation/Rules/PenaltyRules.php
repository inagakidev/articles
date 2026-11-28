<?php

namespace App\Domain\Moderation\Rules;

/** Durações e prazos das penalidades (D92). */
final class PenaltyRules
{
    /** Durações da suspensão, em dias, como na prancha. */
    public const SUSPENSION_DAYS = [7, 15, 30];

    /** Prazo para contestar, a partir da notificação (RF-230); também o da reabertura (RF-234). */
    public const APPEAL_DAYS = 7;
}
