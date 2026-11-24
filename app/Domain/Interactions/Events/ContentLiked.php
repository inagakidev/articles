<?php

namespace App\Domain\Interactions\Events;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;

/** Alguém curtiu um artigo ou comentário pela primeira vez. */
class ContentLiked implements ShouldDispatchAfterCommit
{
    use Dispatchable;

    public function __construct(
        public readonly User $liker,
        public readonly Article|Comment $item,
    ) {}
}
