<?php

namespace App\Domain\Reports\Enums;

/** O que pode ser denunciado (RF-164). */
enum ReportTarget: string
{
    case Article = 'article';
    case Comment = 'comment';
    case Profile = 'profile';
}
