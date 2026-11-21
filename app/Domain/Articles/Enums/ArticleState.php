<?php

namespace App\Domain\Articles\Enums;

/**
 * Estado do artigo (REQUIREMENTS §5.1). "Na lixeira" não é um valor daqui:
 * é a exclusão suave, que guarda este estado para a restauração (D79).
 */
enum ArticleState: string
{
    /** Nunca teve versão aprovada, ou foi despublicado. */
    case Unpublished = 'unpublished';

    /** Existe uma versão aprovada em vigor. */
    case Published = 'published';
}
