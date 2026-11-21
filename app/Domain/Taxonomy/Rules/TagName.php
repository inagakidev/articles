<?php

namespace App\Domain\Taxonomy\Rules;

use Illuminate\Support\Str;

/**
 * Forma única de uma tag (RF-128): "React JS", "react-js" e "Réact JS" viram
 * "react-js". Mantém os sinais de nomes técnicos (c#, c++, node.js).
 */
final class TagName
{
    public const MAX = 40;

    public static function normalize(string $raw): string
    {
        $name = Str::lower(Str::ascii(trim($raw)));
        $name = (string) preg_replace('/[\s_]+/', '-', $name);
        $name = (string) preg_replace('/[^a-z0-9+#.\-]/', '', $name);
        $name = (string) preg_replace('/-{2,}/', '-', $name);

        return mb_substr(trim($name, '-.'), 0, self::MAX);
    }

    /**
     * Chave "solta", para sugerir uniões que a normalização não pega:
     * "reactjs", "react-js" e "react" dão "react" (D79). É só sugestão; quem
     * une é a administradora.
     */
    public static function looseKey(string $name): string
    {
        $key = (string) preg_replace('/[\-._]/', '', $name);

        return strlen($key) > 3 ? (string) preg_replace('/js$/', '', $key) : $key;
    }
}
