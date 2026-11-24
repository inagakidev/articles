<?php

namespace App\Domain\Reports\Enums;

/**
 * Desfechos de uma decisão (RF-176 a RF-178). Os com penalidade entram
 * com a fatia 21.
 */
enum ReportOutcome: string
{
    case Dismiss = 'dismiss';
    case UnpublishArticle = 'unpublish_article';
    case DeleteArticle = 'delete_article';
    case DeleteComment = 'delete_comment';
    case ModerateProfile = 'moderate_profile';

    /** @return list<self> */
    public static function for(ReportTarget $target): array
    {
        return match ($target) {
            ReportTarget::Article => [self::UnpublishArticle, self::DeleteArticle, self::Dismiss],
            ReportTarget::Comment => [self::DeleteComment, self::Dismiss],
            ReportTarget::Profile => [self::ModerateProfile, self::Dismiss],
        };
    }
}
