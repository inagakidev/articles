<?php

namespace App\Domain\Interactions\Events;

use App\Models\Comment;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;

/** Um comentário ou resposta foi publicado; sai só depois de gravado. */
class CommentPosted implements ShouldDispatchAfterCommit
{
    use Dispatchable;

    public function __construct(public readonly Comment $comment) {}
}
