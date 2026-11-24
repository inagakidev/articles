<?php

namespace App\Domain\Reports\Exceptions;

use RuntimeException;

/** Uma denúncia ou decisão que a regra recusa; a mensagem é a chave de tradução. */
class ReportRefused extends RuntimeException
{
    /** O item não existe ou não está à vista. */
    public static function notFound(): self
    {
        return new self('reports.refused.not_found');
    }

    /** Ninguém denuncia o próprio conteúdo (RF-168). */
    public static function own(): self
    {
        return new self('reports.refused.own');
    }

    /** Uma denúncia aberta por pessoa e item (RF-167). */
    public static function alreadyOpen(): self
    {
        return new self('reports.refused.already_open');
    }

    /** Outra decisão já fechou as denúncias deste item. */
    public static function alreadyDecided(): self
    {
        return new self('reports.refused.already_decided');
    }
}
