<?php

namespace App\Http\Controllers\Interactions;

use App\Domain\Interactions\Actions\LikeContent;
use App\Domain\Interactions\Exceptions\InteractionRefused;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** Curtir e descurtir artigos e comentários (RF-148 a RF-156). */
class LikeController extends Controller
{
    public function article(Request $request, Article $article, LikeContent $likes): RedirectResponse
    {
        return $this->apply(fn () => $likes->article($article, $request->user(), $request->isMethod('POST')));
    }

    public function comment(Request $request, Comment $comment, LikeContent $likes): RedirectResponse
    {
        return $this->apply(fn () => $likes->comment($comment, $request->user(), $request->isMethod('POST')));
    }

    private function apply(callable $change): RedirectResponse
    {
        try {
            $change();
        } catch (InteractionRefused $refused) {
            abort(403, __($refused->getMessage()));
        }

        return back();
    }
}
