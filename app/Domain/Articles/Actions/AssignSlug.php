<?php

namespace App\Domain\Articles\Actions;

use App\Models\Article;
use Illuminate\Support\Str;

/**
 * Dá ao artigo o endereço público, a partir do título, na primeira
 * publicação (D83). Depois disso o slug não muda, nem com um título novo:
 * os links já compartilhados continuam levando ao artigo.
 */
class AssignSlug
{
    /** Tamanho máximo, antes do sufixo de desempate. */
    public const MAX = 100;

    public function handle(Article $article, string $title): string
    {
        if ($article->slug !== null) {
            return $article->slug;
        }

        $base = $this->base($title);
        $slug = $base;

        // Título repetido ganha -2, -3... O índice único do banco segura a
        // corrida rara de duas aprovações iguais ao mesmo tempo.
        for ($suffix = 2; Article::withTrashed()->where('slug', $slug)->exists(); $suffix++) {
            $slug = "{$base}-{$suffix}";
        }

        $article->forceFill(['slug' => $slug])->save();

        return $slug;
    }

    private function base(string $title): string
    {
        $slug = Str::slug($title, language: 'pt');

        if (strlen($slug) > self::MAX) {
            // Corta na última palavra inteira que cabe
            $slug = Str::beforeLast(substr($slug, 0, self::MAX + 1), '-');
        }

        return $slug !== '' ? $slug : 'artigo';
    }
}
