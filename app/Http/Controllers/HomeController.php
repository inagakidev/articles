<?php

namespace App\Http\Controllers;

use App\Domain\Articles\Queries\PublicArticles;
use App\Http\Resources\Articles\ArticleSummaryResource;
use App\Models\Category;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Página de apresentação em `/` (RF-379 a RF-383, D74). Os artigos seguem
 * a regra única de visibilidade (RF-381), e dos autores vão só o nome e a
 * foto de quem publicou (RF-382).
 */
class HomeController extends Controller
{
    /** Até doze, para as duas faixas da comunidade (D74). */
    public const RECENT = 12;

    /** Rostos na comunidade, antes do "+N". */
    public const FACES = 5;

    public function __invoke(PublicArticles $articles): Response
    {
        $authors = $articles->authorsOfTheMonth(self::FACES);

        return Inertia::render('home', [
            'categories' => Category::query()->orderBy('id')->get()
                ->map(fn (Category $category) => [
                    'name' => $category->name(),
                    'color' => $category->color->value,
                ]),
            'recentArticles' => ArticleSummaryResource::collection($articles->recent(self::RECENT))->resolve(),
            'authors' => [
                'count' => $authors['count'],
                'people' => $authors['people']->map(fn (User $user) => [
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                ]),
            ],
        ]);
    }
}
