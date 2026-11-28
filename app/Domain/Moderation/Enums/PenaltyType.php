<?php

namespace App\Domain\Moderation\Enums;

enum PenaltyType: string
{
    case Suspension = 'suspension';
    case Ban = 'ban';
}
