<?php

namespace App\Domain\Accounts\Enums;

/** Documentos que a pessoa aceita no cadastro (RF-013). */
enum PolicyType: string
{
    case Terms = 'terms';
    case Privacy = 'privacy';
}
