<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Articles\Queries\WorkingVersion;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Rules\AuditLabel;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use App\Notifications\Articles\ArticleDeleted;
use Illuminate\Support\Facades\DB;

/**
 * Exclusão permanente pela administradora (RF-122, RF-257): apaga o artigo,
 * as versões e os arquivos das imagens, registra na auditoria sem o
 * conteúdo (RF-293) e avisa a autora.
 */
class DeleteArticle
{
    public function __construct(
        private readonly RecordAudit $audit,
        private readonly WorkingVersion $working,
    ) {}

    public function handle(Article $article, User $admin, string $policyItem, string $reason): void
    {
        DB::transaction(function () use ($article, $admin, $policyItem, $reason) {
            $article = Article::withTrashed()->lockForUpdate()->findOrFail($article->id);
            $current = $article->current_version_id === null ? null : ArticleVersion::query()->find($article->current_version_id);
            $title = (string) ($current ?? $this->working->for($article))?->title;
            $author = $article->author;
            $label = AuditLabel::article($article, $title);

            $article->forceDelete();

            $this->audit->handle($admin, AuditAction::ArticleDeleted, $label, $article, $policyItem, $reason);
            $author?->notify(new ArticleDeleted($title, $reason, $policyItem));
        });
    }
}
