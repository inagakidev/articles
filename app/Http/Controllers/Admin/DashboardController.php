<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Painel da administração. Mostra só o que já existe (D75): as métricas de
 * artigos e denúncias e os avisos de "Precisa da sua atenção" entram com as
 * fatias de moderação, denúncias e contestações.
 */
class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'users' => User::query()->count(),
            ],
            'attention' => [],
            'updatedAt' => now()->toIso8601String(),
        ]);
    }
}
