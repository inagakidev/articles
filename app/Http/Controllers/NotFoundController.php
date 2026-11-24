<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Página "Não achamos esta página" (prancha "Página não encontrada"). Vale
 * para endereço que não existe e para artigo fora do ar: quem não pode ver
 * um artigo não descobre que ele existe (RF-090, p5-03).
 */
class NotFoundController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('errors/not-found')
            ->toResponse($request)
            ->setStatusCode(404);
    }
}
