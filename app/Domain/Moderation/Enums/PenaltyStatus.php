<?php

namespace App\Domain\Moderation\Enums;

enum PenaltyStatus: string
{
    case Active = 'active';
    case Ended = 'ended';
}
