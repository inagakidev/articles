<?php

namespace App\Domain\Moderation\Rules;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
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

    /** "Comentário de @username em “Título” de @autora". */
    public static function comment(Comment $comment): string
    {
        $article = $comment->article;

        return __('audit.comment_label', [
            'author' => '@'.($comment->author->username ?? '?'),
            'article' => self::article($article, $article->currentVersion?->title),
        ]);
    }

    /** "@username", para o perfil. */
    public static function profile(User $user): string
    {
        return '@'.$user->username;
    }
}
