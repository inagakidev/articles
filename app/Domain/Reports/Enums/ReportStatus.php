<?php

namespace App\Domain\Reports\Enums;

/** Status da denúncia (RF-170, RF-175). */
enum ReportStatus: string
{
    case Open = 'open';
    case Upheld = 'upheld';
    case Dismissed = 'dismissed';
    /** O conteúdo saiu antes da análise. */
    case Removed = 'removed';
}
