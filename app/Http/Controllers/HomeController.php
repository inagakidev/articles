<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Página de apresentação em `/` (RF-379 a RF-383).
 *
 * As seções que dependem de conteúdo publicado ficam ocultas enquanto não
 * houver dados (D74): as categorias chegam com a fatia de categorias, e os
 * artigos recentes e os autores, com a leitura pública dos artigos, que
 * aplica a regra única de visibilidade (RF-381) e mostra só o perfil
 * público de quem tem artigo publicado (RF-382).
 */
class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('home', [
            'categories' => [],
            'recentArticles' => [],
            'authors' => ['count' => 0, 'people' => []],
        ]);
    }
}
