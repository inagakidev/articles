<?php

namespace App\Domain\Articles\Enums;

/** Estado de cada versão do artigo (REQUIREMENTS §5.2). */
enum VersionStatus: string
{
    /** Editável; recebe o salvamento automático. */
    case Draft = 'draft';

    /** Retrato congelado enviado para aprovação. */
    case Pending = 'pending';

    /** A versão que o público lê. */
    case Approved = 'approved';

    /** Recusada na revisão ou despublicada, com justificativa. */
    case Rejected = 'rejected';

    /** Aprovada antes; mantida no histórico. */
    case Superseded = 'superseded';

    /** Só o rascunho aceita mudanças de conteúdo. */
    public function isEditable(): bool
    {
        return $this === self::Draft;
    }
}
