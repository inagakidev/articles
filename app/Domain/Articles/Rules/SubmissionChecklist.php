<?php

namespace App\Domain\Articles\Rules;

use App\Models\ArticleVersion;
use App\Support\Editor\DocumentSanitizer;

/**
 * O que uma versão precisa para ir à revisão (RF-318): título, conteúdo,
 * categoria, idioma e texto alternativo (ou decorativa) em todas as
 * imagens e na capa. Capa e tags são opcionais. O conteúdo também precisa
 * estar dentro do esquema: o envio recusa, em vez de limpar em silêncio (D51).
 */
final class SubmissionChecklist
{
    /** @return list<'title'|'content'|'category'|'language'|'images_alt'|'content_schema'> */
    public static function missing(ArticleVersion $version): array
    {
        $content = $version->content ?? DocumentSanitizer::empty();
        $missing = [];

        if (trim((string) $version->title) === '') {
            $missing[] = 'title';
        }

        if (trim((string) $version->content_text) === '' && DocumentSanitizer::imageIds($content) === []) {
            $missing[] = 'content';
        }

        if ($version->category_id === null) {
            $missing[] = 'category';
        }

        if ($version->language === null) {
            $missing[] = 'language';
        }

        if (self::imageWithoutAlt($content) || ($version->cover_image_id !== null && self::needsAlt($version->cover_alt, $version->cover_decorative))) {
            $missing[] = 'images_alt';
        }

        if ((new DocumentSanitizer)->sanitize($content) !== $content) {
            $missing[] = 'content_schema';
        }

        return $missing;
    }

    private static function needsAlt(mixed $alt, mixed $decorative): bool
    {
        return $decorative !== true && trim(is_string($alt) ? $alt : '') === '';
    }

    /** @param  array<string, mixed>  $node */
    private static function imageWithoutAlt(array $node): bool
    {
        if (($node['type'] ?? null) === 'image') {
            $attrs = is_array($node['attrs'] ?? null) ? $node['attrs'] : [];

            return self::needsAlt($attrs['alt'] ?? null, $attrs['decorative'] ?? null);
        }

        foreach (is_array($node['content'] ?? null) ? $node['content'] : [] as $child) {
            if (is_array($child) && self::imageWithoutAlt($child)) {
                return true;
            }
        }

        return false;
    }
}
