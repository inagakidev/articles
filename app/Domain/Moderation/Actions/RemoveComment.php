<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Rules\AuditLabel;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * A administradora exclui um comentário de outra pessoa (RF-145, RF-258),
 * com o item da Política e a justificativa na auditoria. As respostas saem
 * junto (RF-146), e quem escreveu não é avisado (RF-147).
 */
class RemoveComment
{
    public function __construct(private readonly RecordAudit $audit) {}

    public function handle(Comment $comment, User $admin, string $policyItem, string $reason): void
    {
        DB::transaction(function () use ($comment, $admin, $policyItem, $reason) {
            $article = $comment->article;
            $title = $article->currentVersion?->title;
            $label = __('audit.comment_label', [
                'author' => '@'.($comment->author->username ?? '?'),
                'article' => AuditLabel::article($article, $title),
            ]);

            $this->audit->handle($admin, AuditAction::CommentDeleted, $label, $comment, $policyItem, $reason, [
                'replies' => $comment->replies()->count(),
            ]);
            $comment->delete();
        });
    }
}
