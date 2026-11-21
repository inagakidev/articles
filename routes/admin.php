<?php

use App\Http\Controllers\Admin\DashboardController;
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
        });
    });
