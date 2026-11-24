<?php

namespace App\Domain\Articles\Queries;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use App\Support\Editor\ArticleRenderer;
use Illuminate\Support\Collection;

/**
 * Os artigos de quem escreve, cada um em uma única seção (RF-112 a RF-115):
 * publicados; e, entre os nunca publicados, pela versão mais recente —
 * rascunho, aguardando revisão ou não aprovado.
 */
class AuthorArticles
{
    public const SECTIONS = ['drafts', 'review', 'rejected', 'published'];

    /** Colunas lidas das versões; o documento inteiro não é necessário aqui. */
    private const COLUMNS = ['id', 'article_id', 'status', 'title', 'content_text', 'submitted_at', 'decided_at', 'decision_reason', 'created_at', 'updated_at'];

    /** @return array<string, list<array<string, mixed>>> */
    public function sections(User $author): array
    {
        $sections = array_fill_keys(self::SECTIONS, []);

        Article::query()
            ->where('user_id', $author->id)
            ->with(['versions' => fn ($query) => $query->select(self::COLUMNS)->orderBy('id')])
            ->latest('updated_at')
            ->get()
            ->each(function (Article $article) use (&$sections) {
                [$section, $row] = $this->row($article);
                $sections[$section][] = $row;
            });

        return $sections;
    }

    /** @return array{0: string, 1: array<string, mixed>} */
    private function row(Article $article): array
    {
        /** @var Collection<int, ArticleVersion> $versions */
        $versions = $article->versions;
        $draft = $versions->firstWhere('status', VersionStatus::Draft);
        $pending = $versions->firstWhere('status', VersionStatus::Pending);
        $current = $versions->firstWhere('id', $article->current_version_id);
        $latest = $versions->last();

        $base = [
            'id' => $article->id,
            'updatedAt' => $article->updated_at?->toIso8601String(),
            'hasDraft' => $draft !== null,
            'pendingSubmittedAt' => $pending?->submitted_at?->toIso8601String(),
        ];

        if ($article->state === ArticleState::Published && $current !== null) {
            // A última decisão depois da versão em vigor diz se há edição rejeitada.
            $lastDecided = $versions->filter(fn (ArticleVersion $version) => $version->id > $current->id && $version->status === VersionStatus::Rejected)->last();

            return ['published', [
                ...$base,
                ...$this->version($current),
                // Endereço público, para "Ver" (D83)
                'url' => $article->slug === null ? null : route('articles.show', $article->slug, absolute: false),
                'firstPublishedAt' => $article->first_published_at?->toIso8601String(),
                'currentSince' => $current->decided_at?->toIso8601String(),
                'editRejected' => $pending === null && $lastDecided !== null,
            ]];
        }

        $section = match ($latest?->status) {
            VersionStatus::Pending => 'review',
            VersionStatus::Rejected => 'rejected',
            default => 'drafts',
        };

        return [$section, [...$base, ...($latest === null ? ['title' => null, 'words' => 0] : $this->version($latest))]];
    }

    /** @return array<string, mixed> */
    private function version(ArticleVersion $version): array
    {
        return [
            'versionId' => $version->id,
            'title' => $version->title,
            'words' => ArticleRenderer::countWords((string) $version->content_text),
            'submittedAt' => $version->submitted_at?->toIso8601String(),
            'decidedAt' => $version->decided_at?->toIso8601String(),
            'reason' => $version->status === VersionStatus::Rejected ? $version->decision_reason : null,
        ];
    }
}
