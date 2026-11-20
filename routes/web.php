<?php

use App\Http\Controllers\Accounts\UnverifiedEmailController;
use App\Http\Controllers\Accounts\UsernameAvailabilityController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\PolicyController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::put('locale', LocaleController::class)->name('locale.update');

// Termos de uso e Política de privacidade (D72)
Route::get('terms', PolicyController::class)->defaults('type', 'terms')->name('policies.terms');
Route::get('privacy', PolicyController::class)->defaults('type', 'privacy')->name('policies.privacy');

// Disponibilidade do username enquanto a pessoa digita (RF-029)
Route::get('username-availability', UsernameAvailabilityController::class)
    ->middleware('throttle:30,1')
    ->name('username.availability');

Route::middleware('auth')->group(function () {
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
