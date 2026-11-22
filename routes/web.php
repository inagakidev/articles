<?php

use App\Http\Controllers\Accounts\PolicyAcceptanceController;
use App\Http\Controllers\Accounts\UnverifiedEmailController;
use App\Http\Controllers\Accounts\UsernameAvailabilityController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\Profiles\ShowProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::put('locale', LocaleController::class)->name('locale.update');

// Imagens enviadas, com a regra de acesso de cada uma (D53)
Route::get('media/{path}', MediaController::class)->where('path', '.*')->name('media.show');

// Perfil público (RF-025, D77)
Route::get('@{username}', ShowProfileController::class)
    ->where('username', '[a-z][a-z0-9_-]{2,29}')
    ->name('profiles.show');

// Termos de uso, Política de privacidade e Política de conteúdo (D73)
Route::get('terms', PolicyController::class)->defaults('type', 'terms')->name('policies.terms');
Route::get('privacy', PolicyController::class)->defaults('type', 'privacy')->name('policies.privacy');
Route::get('content-policy', PolicyController::class)->defaults('type', 'content')->name('policies.content');

// Disponibilidade do username enquanto a pessoa digita (RF-029)
Route::get('username-availability', UsernameAvailabilityController::class)
    ->middleware('throttle:30,1')
    ->name('username.availability');

Route::middleware('auth')->group(function () {
    // Novo aceite quando os Termos ou a Privacidade mudam (D73)
    Route::get('policies/accept', [PolicyAcceptanceController::class, 'show'])->name('policies.acceptance.show');
    Route::post('policies/accept', [PolicyAcceptanceController::class, 'store'])->name('policies.acceptance.store');

    // "Usar outro e-mail" antes de confirmar (D72)
    Route::put('email/unverified', UnverifiedEmailController::class)
        ->middleware('throttle:6,1')
        ->name('verification.email.update');

    Route::inertia('email/confirmed', 'auth/email-confirmed')
        ->middleware('verified')
        ->name('verification.confirmed');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/articles.php';
