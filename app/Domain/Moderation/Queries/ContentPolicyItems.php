<?php

namespace App\Domain\Moderation\Queries;

use App\Domain\Accounts\Enums\PolicyType;
use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use App\Domain\Accounts\Queries\PolicyDocument;

/**
 * Os itens numerados da Política de conteúdo em vigor ("4.2 · Fontes e
 * atribuição"), que toda rejeição, despublicação e exclusão cita (RF-107,
 * A12). Vêm do próprio texto da política, então mudam junto com ela.
 */
class ContentPolicyItems
{
    public function __construct(
        private readonly CurrentPolicyVersions $versions,
        private readonly PolicyDocument $documents,
    ) {}

    /** @return list<array{id: string, title: string}> */
    public function all(?string $locale = null): array
    {
        $document = $this->documents->load($this->versions->of(PolicyType::Content), $locale);
        $items = [];

        foreach ($document['sections'] as $section) {
            foreach ($section['blocks'] ?? [] as $block) {
                foreach ($block['items'] ?? [] as $item) {
                    if (isset($item['id'], $item['title'])) {
                        $items[] = ['id' => (string) $item['id'], 'title' => (string) $item['title']];
                    }
                }
            }
        }

        return $items;
    }

    /** @return list<string> */
    public function ids(): array
    {
        return array_column($this->all(), 'id');
    }
}
