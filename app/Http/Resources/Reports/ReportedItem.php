<?php

namespace App\Http\Resources\Reports;

use App\Domain\Interactions\Queries\ArticleComments;
use App\Domain\Reports\Enums\ReportTarget;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * O item denunciado para o painel, como está agora (RF-174): o que é,
 * quem escreveu, o texto e onde ver no site.
 */
class ReportedItem
{
    /** Caracteres do trecho na lista. */
    public const EXCERPT = 160;

    public function __construct(private readonly ArticleComments $comments) {}

    /** @return array<string, mixed>|null */
    public function for(ReportTarget $target, Article|Comment|User|null $item): ?array
    {
        return match (true) {
            $item instanceof Article => $this->article($item),
            $item instanceof Comment => $this->comment($item),
            $item instanceof User => $this->profile($item),
            default => null,
        };
    }

    /** @return array<string, mixed> */
    private function article(Article $article): array
    {
        $version = $article->currentVersion ?? $article->versions()->latest('id')->first();

        return [
            'title' => $version?->title,
            'text' => Str::limit(Str::squish((string) $version?->content_text), self::EXCERPT),
            'author' => $this->person($article->author),
            'url' => $article->slug !== null && $article->current_version_id !== null && ! $article->trashed()
                ? route('articles.show', $article->slug, absolute: false)
                : null,
            'replies' => null,
        ];
    }

    /** @return array<string, mixed> */
    private function comment(Comment $comment): array
    {
        $article = $comment->article;
        $page = $this->comments->pageOf($comment);

        return [
            'title' => $article->currentVersion?->title,
            'text' => $comment->body,
            'author' => $this->person($comment->author),
            'url' => $article->slug === null ? null : route('articles.show', array_filter([
                'slug' => $article->slug,
                'comentarios' => $page > 1 ? $page : null,
            ]), absolute: false).'#comentario-'.$comment->id,
            // Excluir leva as respostas junto (RF-146)
            'replies' => $comment->replies()->count(),
        ];
    }

    /** @return array<string, mixed> */
    private function profile(User $user): array
    {
        return [
            'title' => null,
            'text' => $user->bio,
            'author' => $this->person($user),
            'url' => route('profiles.show', ['username' => $user->username], absolute: false),
            'replies' => null,
            'hasPhoto' => $user->avatar_path !== null,
        ];
    }

    /** @return array{name: string, username: string, avatar: string|null}|null */
    private function person(?User $user): ?array
    {
        return $user === null ? null : [
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatar,
        ];
    }
}
