<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Exceptions\InvalidStateTransition;
use App\Domain\Articles\Rules\ArticleTransitions;
use App\Domain\Articles\Rules\VersionTransitions;

/*
 * Os dois estados independentes do artigo e da versão (REQUIREMENTS §5,
 * p4-02): cada transição permitida passa e todas as outras são recusadas.
 */

$allowedVersion = [
    'enviar (RF-344)' => [VersionStatus::Draft, VersionStatus::Pending],
    'retirar (RF-345)' => [VersionStatus::Pending, VersionStatus::Draft],
    'aprovar (RF-346)' => [VersionStatus::Pending, VersionStatus::Approved],
    'rejeitar (RF-347)' => [VersionStatus::Pending, VersionStatus::Rejected],
    'despublicar (RF-348)' => [VersionStatus::Approved, VersionStatus::Rejected],
    'ser substituída (RF-346)' => [VersionStatus::Approved, VersionStatus::Superseded],
];

test('a versão aceita as transições previstas', function (VersionStatus $from, VersionStatus $to) {
    expect(VersionTransitions::allows($from, $to))->toBeTrue();

    VersionTransitions::ensure($from, $to);
})->with($allowedVersion);

test('a versão recusa todas as outras transições', function () use ($allowedVersion) {
    $allowed = array_map(fn (array $pair) => $pair[0]->value.'>'.$pair[1]->value, array_values($allowedVersion));
    $refused = 0;

    foreach (VersionStatus::cases() as $from) {
        foreach (VersionStatus::cases() as $to) {
            if (in_array($from->value.'>'.$to->value, $allowed, true)) {
                continue;
            }

            expect(VersionTransitions::allows($from, $to))->toBeFalse();
            expect(fn () => VersionTransitions::ensure($from, $to))->toThrow(InvalidStateTransition::class);
            $refused++;
        }
    }

    expect($refused)->toBe(25 - count($allowed));
});

test('rejeitada e substituída não voltam: a correção é um rascunho novo (RF-349)', function () {
    foreach (VersionStatus::cases() as $to) {
        expect(VersionTransitions::allows(VersionStatus::Rejected, $to))->toBeFalse()
            ->and(VersionTransitions::allows(VersionStatus::Superseded, $to))->toBeFalse();
    }
});

test('só o rascunho é editável', function () {
    expect(collect(VersionStatus::cases())->filter->isEditable()->all())->toBe([VersionStatus::Draft]);
});

test('o artigo vai de não publicado a publicado e volta só por despublicação', function () {
    expect(ArticleTransitions::allows(ArticleState::Unpublished, ArticleState::Published))->toBeTrue()
        ->and(ArticleTransitions::allows(ArticleState::Published, ArticleState::Unpublished))->toBeTrue()
        ->and(ArticleTransitions::allows(ArticleState::Published, ArticleState::Published))->toBeFalse()
        ->and(ArticleTransitions::allows(ArticleState::Unpublished, ArticleState::Unpublished))->toBeFalse();

    expect(fn () => ArticleTransitions::ensure(ArticleState::Published, ArticleState::Published))
        ->toThrow(InvalidStateTransition::class);
});
