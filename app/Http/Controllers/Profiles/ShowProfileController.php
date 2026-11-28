<?php

namespace App\Http\Controllers\Profiles;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Reports\Enums\ReportTarget;
use App\Domain\Reports\Queries\ReportQueue;
use App\Http\Controllers\Controller;
use App\Http\Resources\Accounts\PublicProfileResource;
use App\Http\Resources\Articles\ArticleSummaryResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Perfil público em /@username (RF-025, D77), com os artigos visíveis da
 * pessoa (p5-06). Conta sem e-mail confirmado não tem perfil público: ela
 * ainda pode ser excluída em 7 dias (RF-023). Esconder o perfil em carência
 * de exclusão e em suspensão entra com as fatias 21 e 22.
 */
class ShowProfileController extends Controller
{
    public function __invoke(Request $request, string $username, PublicArticles $articles, ReportQueue $reports): Response
    {
        $user = User::query()
            ->where('username', mb_strtolower($username))
            ->whereNotNull('email_verified_at')
            // Perfil de conta suspensa ou banida fica oculto (RF-207, RF-225)
            ->notPenalized()
            ->firstOrFail();
        $oldestFirst = $request->query('ordem') === 'antigos';
        $page = $articles->byAuthor($user, $oldestFirst);

        return Inertia::render('profile/show', [
            'profile' => new PublicProfileResource($user),
            'articles' => [
                'data' => ArticleSummaryResource::collection($page->items())->resolve(),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
                'from' => $page->firstItem(),
                'to' => $page->lastItem(),
            ],
            'order' => $oldestFirst ? 'antigos' : 'recentes',
            // Denunciar o perfil: conta confirmada, e não o próprio (RF-164, RF-168)
            'report' => $this->report($request->user(), $user, $reports),
        ]);
    }

    /** @return array{id: int, canReport: bool, reported: bool} */
    private function report(?User $viewer, User $profile, ReportQueue $reports): array
    {
        $can = $viewer !== null && $viewer->hasVerifiedEmail() && $viewer->id !== $profile->id;

        return [
            'id' => $profile->id,
            'canReport' => $can,
            'reported' => $can && $reports->openBy($viewer, ReportTarget::Profile, [$profile->id]) !== [],
        ];
    }
}
