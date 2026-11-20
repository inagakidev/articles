<?php

namespace App\Domain\Accounts\Queries;

use App\Models\PolicyVersion;
use RuntimeException;

/**
 * O texto de uma versão de política, em resources/policies/<tipo>/<versão>.<idioma>.json
 * (D73). Troca os contatos pela configuração (`{privacy_email}`,
 * `{contact_email}`) e os links `route:<nome>` pelo endereço da rota.
 */
class PolicyDocument
{
    /** Palavras lidas por minuto, para o "min de leitura". */
    private const WORDS_PER_MINUTE = 200;

    /**
     * @return array{title: string, description: string, summary: list<array<string, string>>, sections: list<array<string, mixed>>, changes: list<string>, readingMinutes: int}
     */
    public function load(PolicyVersion $version, ?string $locale = null): array
    {
        $folder = resource_path("policies/{$version->type->value}");
        $file = collect([$locale ?? app()->getLocale(), config('app.locales')[0]])
            ->map(fn (string $candidate) => "{$folder}/{$version->version}.{$candidate}.json")
            ->first(fn (string $path) => is_file($path));

        $json = $file === null ? false : file_get_contents($file);

        if ($json === false) {
            throw new RuntimeException("Texto da política {$version->type->value} {$version->version} não encontrado.");
        }

        $document = json_decode($this->resolve($json), true, flags: JSON_THROW_ON_ERROR);
        $document['readingMinutes'] = $this->readingMinutes($document);

        return $document;
    }

    /** Contatos da configuração e links para outras páginas. */
    private function resolve(string $json): string
    {
        $json = strtr($json, [
            '{privacy_email}' => config('app.contacts.privacy'),
            '{contact_email}' => config('app.contacts.general'),
        ]);

        return preg_replace_callback(
            '/\]\(route:([a-z.]+)\)/',
            fn (array $match) => ']('.route($match[1], absolute: false).')',
            $json,
        );
    }

    /** @param  array<string, mixed>  $document */
    private function readingMinutes(array $document): int
    {
        $words = 0;
        array_walk_recursive($document, function (mixed $value) use (&$words) {
            if (is_string($value)) {
                $words += str_word_count(strip_tags($value));
            }
        });

        return max(1, (int) round($words / self::WORDS_PER_MINUTE));
    }
}
