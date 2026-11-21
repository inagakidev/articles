<?php

use App\Http\Controllers\Settings\AvatarController;
use App\Http\Controllers\Settings\EmailChangeConfirmationController;
use App\Http\Controllers\Settings\EmailChangeController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

// Configurações (prancha "Configurações"). Conta sem confirmar ainda edita o
// perfil e a aparência (RF-297); e-mail e senha pedem a conta confirmada.
Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::post('settings/avatar', [AvatarController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('avatar.update');
    Route::delete('settings/avatar', [AvatarController::class, 'destroy'])->name('avatar.destroy');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    // Troca de e-mail com confirmação no endereço novo (RF-030)
    Route::post('settings/email', [EmailChangeController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('settings.email.store');
    Route::delete('settings/email', [EmailChangeController::class, 'destroy'])->name('settings.email.destroy');
});

Route::get('settings/email/confirm/{user}/{hash}', EmailChangeConfirmationController::class)
    ->middleware(['signed', 'throttle:6,1'])
    ->name('settings.email.confirm');
