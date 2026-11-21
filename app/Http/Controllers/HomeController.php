<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Página de apresentação em `/` (RF-379 a RF-383).
 *
 * As seções que dependem de conteúdo publicado ficam ocultas enquanto não
 * houver dados (D74). As categorias já existem (D79); os artigos recentes
 * e os autores chegam com a leitura pública dos artigos, que
 * aplica a regra única de visibilidade (RF-381) e mostra só o perfil
 * público de quem tem artigo publicado (RF-382).
 */
class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('home', [
            'categories' => Category::query()->orderBy('id')->get()
                ->map(fn (Category $category) => [
                    'name' => $category->name(),
                    'color' => $category->color->value,
                ]),
            'recentArticles' => [],
            'authors' => ['count' => 0, 'people' => []],
        ]);
    }
}
