<?php

namespace App\Domain\Moderation\Rules;

use App\Models\Article;
use Illuminate\Support\Str;

/**
 * Como um artigo aparece na auditoria: “Título” de @username. Fica em texto
 * porque o registro precisa continuar legível depois que o artigo some.
 */
final class AuditLabel
{
    public static function article(Article $article, ?string $title): string
    {
        $name = Str::limit($title ?? '', 80);
        $author = $article->author?->username;

        return $author === null ? "“{$name}”" : "“{$name}” de @{$author}";
    }
}
