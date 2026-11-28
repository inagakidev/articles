<?php

namespace App\Domain\Moderation\Enums;

enum AppealStatus: string
{
    case Open = 'open';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
}
