<?php

namespace App\Domain\Moderation\Rules;

use App\Models\User;

class PenaltyLabel
{
    public static function user(User $user): string
    {
        return '@'.$user->username.' — '.$user->name;
    }
}
