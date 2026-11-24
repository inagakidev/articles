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
    case CategoryCreated = 'category_created';
    case CategoryUpdated = 'category_updated';
    case CategoryDeleted = 'category_deleted';
    case TagBlocked = 'tag_blocked';
    case TagUnblocked = 'tag_unblocked';
    case TagMerged = 'tag_merged';
    case TagDeleted = 'tag_deleted';

    /** Chave de tradução do nome da ação. */
    public function label(): string
    {
        return 'audit.action.'.$this->value;
    }
}
