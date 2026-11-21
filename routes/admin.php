<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\Admin\TwoFactorSetupController;
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
