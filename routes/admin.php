<?php

use App\Http\Controllers\Admin\AppealController;
use App\Http\Controllers\Admin\ApprovalQueueController;
use App\Http\Controllers\Admin\ArticleModerationController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\Admin\TwoFactorSetupController;
use App\Http\Controllers\Admin\UserPenaltyController;
use App\Http\Middleware\EnsureTwoFactorConfirmed;
use Illuminate\Support\Facades\Route;

// Administração (D56, D75): conta confirmada, permissão de administradora e,
// para o painel, 2FA confirmado (RF-017).
Route::middleware(['auth', 'verified', 'can:access-admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('two-factor', TwoFactorSetupController::class)
            ->middleware('password.confirm')
            ->name('two-factor.show');

        Route::middleware(EnsureTwoFactorConfirmed::class)->group(function () {
            Route::get('/', DashboardController::class)->name('dashboard');

            // Fila de aprovação e revisão (RF-249, RF-378, D87)
            Route::get('queue', ApprovalQueueController::class)->name('queue');
            Route::get('versions/{version}', [ReviewController::class, 'show'])->name('review');
            Route::post('versions/{version}/decision', [ReviewController::class, 'store'])->name('review.decide');

            // Despublicar e excluir de vez, a partir da leitura (RF-111, RF-122)
            Route::post('articles/{article}/unpublish', [ArticleModerationController::class, 'unpublish'])->name('articles.unpublish');
            Route::delete('articles/{article}', [ArticleModerationController::class, 'destroy'])->withTrashed()->name('articles.destroy');

            // Denúncias: a lista por item, a análise e a decisão (RF-252, D91)
            Route::get('reports', [ReportController::class, 'index'])->name('reports');
            Route::get('reports/{target}/{id}', [ReportController::class, 'show'])
                ->whereIn('target', ['article', 'comment', 'profile'])
                ->whereNumber('id')
                ->name('reports.show');
            Route::post('reports/{target}/{id}/decision', [ReportController::class, 'decide'])
                ->whereIn('target', ['article', 'comment', 'profile'])
                ->whereNumber('id')
                ->name('reports.decide');

            // Usuários penalizados e contestações (RF-254 a RF-260, fatia 21)
            Route::get('users', [UserPenaltyController::class, 'index'])->name('users');
            Route::get('users/{user}', [UserPenaltyController::class, 'show'])->name('users.show');
            Route::post('users/{user}/suspend', [UserPenaltyController::class, 'suspend'])->name('users.suspend');
            Route::post('users/{user}/ban', [UserPenaltyController::class, 'ban'])->name('users.ban');
            Route::post('users/{user}/reactivate', [UserPenaltyController::class, 'reactivate'])->name('users.reactivate');
            // Reabrir o prazo de contestar um banimento retido (RF-234)
            Route::post('penalties/{penalty}/reopen', [UserPenaltyController::class, 'reopen'])->name('penalties.reopen');

            Route::get('appeals', [AppealController::class, 'index'])->name('appeals');
            Route::post('appeals/{appeal}/decision', [AppealController::class, 'decide'])->name('appeals.decide');

            // Auditoria: só consulta e exportação (RF-259, RF-291)
            Route::get('audit', [AuditController::class, 'index'])->name('audit');
            Route::get('audit/export', [AuditController::class, 'export'])->name('audit.export');

            // Categorias e tags (RF-124 a RF-129, D79)
            Route::get('taxonomy', TaxonomyController::class)->name('taxonomy');
            Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
            Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
            Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
            Route::post('tags/{tag}/block', [TagController::class, 'block'])->name('tags.block');
            Route::delete('tags/{tag}/block', [TagController::class, 'unblock'])->name('tags.unblock');
            Route::post('tags/{tag}/merge', [TagController::class, 'merge'])->name('tags.merge');
            Route::delete('tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');
        });
    });
