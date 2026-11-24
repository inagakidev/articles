<?php

namespace App\Domain\Reports\Listeners;

use App\Domain\Reports\Actions\CloseRemovedReports;
use App\Domain\Reports\Enums\ReportTarget;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;

/**
 * Antes de o conteúdo sair de vez, fecha as denúncias dele e do que sai
 * junto pelo banco (respostas, comentários do artigo, conteúdo da conta),
 * que não dispara eventos próprios (RF-175).
 */
class CloseReportsOfRemovedContent
{
    public function __construct(private readonly CloseRemovedReports $close) {}

    public function comment(Comment $comment): void
    {
        $this->close->handle(ReportTarget::Comment, $this->withReplies([$comment->id]));
    }

    public function article(Article $article): void
    {
        $this->close->handle(ReportTarget::Article, [$article->id]);
        $this->close->handle(ReportTarget::Comment, $this->ids(Comment::query()->where('article_id', $article->id)->pluck('id')->all()));
    }

    public function user(User $user): void
    {
        $articles = $this->ids(Article::query()->withTrashed()->where('user_id', $user->id)->pluck('id')->all());
        $comments = Comment::query()
            ->where('user_id', $user->id)
            ->orWhereIn('article_id', $articles)
            ->pluck('id')
            ->all();

        $this->close->handle(ReportTarget::Profile, [$user->id]);
        $this->close->handle(ReportTarget::Article, $articles);
        $this->close->handle(ReportTarget::Comment, $this->withReplies($this->ids($comments)));
    }

    /**
     * @param  list<int>  $ids
     * @return list<int>
     */
    private function withReplies(array $ids): array
    {
        $all = $ids;
        $level = $ids;

        while ($level !== []) {
            $level = $this->ids(Comment::query()->whereIn('parent_id', $level)->pluck('id')->all());
            $all = [...$all, ...$level];
        }

        return $all;
    }

    /**
     * @param  array<int, mixed>  $values
     * @return list<int>
     */
    private function ids(array $values): array
    {
        return array_values(array_map(intval(...), $values));
    }
}
