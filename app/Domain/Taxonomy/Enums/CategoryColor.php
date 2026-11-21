<?php

namespace App\Domain\Taxonomy\Enums;

/** Pastéis fixos do DESIGN §2.7, pelo nome; o frontend os mapeia para os tokens. */
enum CategoryColor: string
{
    case Lavender = 'lavender';
    case Lilac = 'lilac';
    case Mint = 'mint';
    case Yellow = 'yellow';
    case Pink = 'pink';
    case Blue = 'blue';
    case Peach = 'peach';
}
