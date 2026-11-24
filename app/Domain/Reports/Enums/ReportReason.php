<?php

namespace App\Domain\Reports\Enums;

/** Motivos da denúncia (RF-166); "outro" pede detalhes. */
enum ReportReason: string
{
    case Spam = 'spam';
    case Offensive = 'offensive';
    case Plagiarism = 'plagiarism';
    case Misleading = 'misleading';
    case Other = 'other';
}
