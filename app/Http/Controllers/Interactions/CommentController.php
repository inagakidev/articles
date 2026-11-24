<?php

namespace App\Http\Controllers\Interactions;

use App\Domain\Interactions\Actions\EditComment;
use App\Domain\Interactions\Actions\PostComment;
use App\Domain\Interactions\Exceptions\InteractionRefused;
use App\Domain\Interactions\Queries\ArticleComments;
use App\Domain\Moderation\Actions\RemoveComment;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerationRequest;
use App\Http\Requests\Interactions\CommentRequest;
use App\Models\Article;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Escrever, responder, editar e apagar comentários (RF-138 a RF-146). A
 * página volta para o mesmo lugar da leitura.
 */
class CommentController extends Controller
{
    public function store(CommentRequest $request, Article $article, PostComment $post, ArticleComments $conversation): RedirectResponse
    {
        $parent = $request->filled('parent_id')
            ? Comment::query()->where('article_id', $article->id)->find($request->integer('parent_id'))
            : null;

        try {
            $comment = $post->handle($article, $request->user(), trim($request->validated('body')), $parent);
        } catch (InteractionRefused $refused) {
            throw ValidationException::withMessages(['body' => __($refused->getMessage(), ['seconds' => $refused->seconds])]);
        }

        // Um comentário novo entra no fim da conversa: abre a página dele.
        // Uma resposta fica na mesma página do comentário respondido.
        if ($parent !== null) {
            return back();
        }

        $page = $conversation->pageOf($comment);

        return redirect()->route('articles.show', array_filter(['slug' => $article->slug, 'comentarios' => $page > 1 ? $page : null]));
    }

    public function update(CommentRequest $request, Comment $comment, EditComment $edit): RedirectResponse
    {
        Gate::authorize('update', $comment);

        $edit->handle($comment, trim($request->validated('body')));

        return back();
    }

    /** Quem escreveu e a autora do artigo apagam sem justificativa (RF-143, RF-144). */
    public function destroy(Comment $comment): RedirectResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('comments.deleted')]);

        return back();
    }

    /** A administradora apaga como moderação, com item e justificativa (RF-145). */
    public function moderate(ModerationRequest $request, Comment $comment, RemoveComment $remove): RedirectResponse
    {
        Gate::authorize('moderate', $comment);

        $remove->handle($comment, $request->user(), $request->validated('policy_item'), $request->validated('reason'));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('comments.deleted')]);

        return back();
    }
}
