<?php

namespace App\Domain\Audit\Enums;

/**
 * Ações administrativas registradas na auditoria (RF-293). As de denúncias,
 * penalidades e contestações entram com as fatias delas.
 */
enum AuditAction: string
{
    case VersionApproved = 'version_approved';
    case VersionRejected = 'version_rejected';
    case ArticleUnpublished = 'article_unpublished';
    case ArticleDeleted = 'article_deleted';
    // A lixeira venceu: a rotina apagou o artigo, sem ninguém por trás
    case ArticleTrashExpired = 'article_trash_expired';
    case CommentDeleted = 'comment_deleted';
    case ProfileModerated = 'profile_moderated';
    case ReportDismissed = 'report_dismissed';
    case CategoryCreated = 'category_created';
    case CategoryUpdated = 'category_updated';
    case CategoryDeleted = 'category_deleted';
    case TagBlocked = 'tag_blocked';
    case TagUnblocked = 'tag_unblocked';
    case TagMerged = 'tag_merged';
    case TagDeleted = 'tag_deleted';
    case UserSuspended = 'user_suspended';
    case UserBanned = 'user_banned';
    case UserReactivated = 'user_reactivated';
    case AppealAccepted = 'appeal_accepted';
    case AppealRejected = 'appeal_rejected';
    case AppealReopened = 'appeal_reopened';

    /** Chave de tradução do nome da ação. */
    public function label(): string
    {
        return 'audit.action.'.$this->value;
    }
}
