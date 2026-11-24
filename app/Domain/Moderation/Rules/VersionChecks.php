<?php

namespace App\Domain\Moderation\Rules;

use App\Models\ArticleVersion;

/**
 * O resumo da versão para a revisão (prancha "Revisar versão"): quantas
 * imagens, contando a capa, têm texto alternativo ou são decorativas, e
 * quantos links diferentes o texto tem. Os links não são abertos: conferir
 * se estão quebrados exigiria acessar sites de fora.
 */
final class VersionChecks
{
    /** @return array{images: int, imagesWithAlt: int, links: int} */
    public static function of(ArticleVersion $version): array
    {
        $tally = ['images' => 0, 'imagesWithAlt' => 0, 'links' => []];
        self::walk($version->content ?? [], $tally);

        if ($version->cover_image_id !== null) {
            $tally['images']++;
            $tally['imagesWithAlt'] += self::described($version->cover_alt, $version->cover_decorative) ? 1 : 0;
        }

        return ['images' => $tally['images'], 'imagesWithAlt' => $tally['imagesWithAlt'], 'links' => count($tally['links'])];
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array{images: int, imagesWithAlt: int, links: array<string, true>}  $tally
     */
    private static function walk(array $node, array &$tally): void
    {
        $attrs = is_array($node['attrs'] ?? null) ? $node['attrs'] : [];

        if (($node['type'] ?? null) === 'image') {
            $tally['images']++;
            $tally['imagesWithAlt'] += self::described($attrs['alt'] ?? null, $attrs['decorative'] ?? null) ? 1 : 0;
        }

        foreach (is_array($node['marks'] ?? null) ? $node['marks'] : [] as $mark) {
            $href = is_array($mark) && ($mark['type'] ?? null) === 'link' ? ($mark['attrs']['href'] ?? null) : null;

            if (is_string($href) && $href !== '') {
                $tally['links'][$href] = true;
            }
        }

        foreach (is_array($node['content'] ?? null) ? $node['content'] : [] as $child) {
            if (is_array($child)) {
                self::walk($child, $tally);
            }
        }
    }

    private static function described(mixed $alt, mixed $decorative): bool
    {
        return $decorative === true || trim(is_string($alt) ? $alt : '') !== '';
    }
}
