<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Queries\AuthorArticles;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Meus artigos (prancha "Meus artigos", RF-112 a RF-115). */
class MyArticlesController extends Controller
{
    /** Estimativa de revisão mostrada ao autor; não é prazo garantido (RF-377). */
    public const REVIEW_HOURS = 6;

    public function __invoke(Request $request, AuthorArticles $articles): Response
    {
        $user = $request->user();

        return Inertia::render('my-articles/index', [
            'sections' => $articles->sections($user),
            'trashCount' => Article::onlyTrashed()->where('user_id', $user->id)->count(),
            'reviewHours' => self::REVIEW_HOURS,
        ]);
    }
}
