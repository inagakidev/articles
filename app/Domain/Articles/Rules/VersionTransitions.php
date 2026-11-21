<?php

namespace App\Domain\Articles\Rules;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Exceptions\InvalidStateTransition;

/**
 * Transições permitidas entre os estados de uma versão (RF-343 a RF-350).
 * Uma versão nova nasce rascunho (RF-343). Restaurar uma versão substituída
 * (RF-350) fica para depois do MVP, então não entra aqui.
 */
final class VersionTransitions
{
    /** @var array<string, list<VersionStatus>> */
    private const ALLOWED = [
        // RF-344: envio para aprovação
        'draft' => [VersionStatus::Pending],
        // RF-345 retirada; RF-346 aprovação; RF-347 rejeição
        'pending' => [VersionStatus::Draft, VersionStatus::Approved, VersionStatus::Rejected],
        // RF-348 despublicação; RF-346 substituída por uma nova aprovação
        'approved' => [VersionStatus::Rejected, VersionStatus::Superseded],
        // RF-349: a correção vira um rascunho novo, baseado nesta; a versão
        // rejeitada não muda de estado, então nada sai daqui.
        'rejected' => [],
        'superseded' => [],
    ];

    public static function allows(VersionStatus $from, VersionStatus $to): bool
    {
        return in_array($to, self::ALLOWED[$from->value], true);
    }

    /** @throws InvalidStateTransition */
    public static function ensure(VersionStatus $from, VersionStatus $to): void
    {
        if (! self::allows($from, $to)) {
            throw InvalidStateTransition::between($from, $to);
        }
    }
}
