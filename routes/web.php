<?php

use App\Http\Controllers\Accounts\PolicyAcceptanceController;
use App\Http\Controllers\Accounts\RequiredUsernameController;
use App\Http\Controllers\Accounts\UnverifiedEmailController;
use App\Http\Controllers\Accounts\UsernameAvailabilityController;
use App\Http\Controllers\Articles\PublicArticlesController;
use App\Http\Controllers\Articles\SearchController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\Moderation\PenaltyController;
use App\Http\Controllers\NotFoundController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\Profiles\ShowProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

// Listagem e leitura públicas (RF-379, D83)
Route::get('artigos', [PublicArticlesController::class, 'index'])->name('articles.index');
Route::get('artigos/{slug}', [PublicArticlesController::class, 'show'])
    ->where('slug', '[a-z0-9]+(?:-[a-z0-9]+)*')
    ->name('articles.show');

// Busca (RF-130 a RF-136, D85)
Route::get('busca', SearchController::class)->middleware('throttle:60,1')->name('search');

Route::put('locale', LocaleController::class)->name('locale.update');

// Imagens enviadas, com a regra de acesso de cada uma (D53)
Route::get('media/{path}', MediaController::class)->where('path', '.*')->name('media.show');

// Perfil público (RF-025, D77)
Route::get('@{username}', ShowProfileController::class)
    ->where('username', '[a-z][a-z0-9_-]{2,29}')
    ->name('profiles.show');

// Conta penalizada e contestação pelo link assinado do e-mail.
Route::get('conta/suspensa', [PenaltyController::class, 'suspended'])
    ->middleware('auth')
    ->name('penalty.suspended');
Route::get('contestar/{penalty}', [PenaltyController::class, 'appeal'])
    ->middleware('signed')
    ->name('penalty.appeal');
Route::post('contestar/{penalty}', [PenaltyController::class, 'submit'])
    ->middleware('signed')
    ->name('penalty.appeal.submit');

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

    // Username considerado inadequado: troca antes de continuar (RF-178, D91)
    Route::get('trocar-username', [RequiredUsernameController::class, 'show'])->name('username.required');
    Route::put('trocar-username', [RequiredUsernameController::class, 'update'])
        ->middleware('throttle:10,1')
        ->name('username.required.update');

    // "Usar outro e-mail" antes de confirmar (D72)
    Route::put('email/unverified', UnverifiedEmailController::class)
        ->middleware('throttle:6,1')
        ->name('verification.email.update');

    Route::inertia('email/confirmed', 'auth/email-confirmed')
        ->middleware('verified')
        ->name('verification.confirmed');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // O painel do kit inicial deu lugar a Meus artigos (D82)
    Route::redirect('dashboard', 'my-articles')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/articles.php';
require __DIR__.'/interactions.php';
require __DIR__.'/notifications.php';

// Endereço que não existe: a página 404 do site, com o cabeçalho e o idioma
// de sempre, porque o fallback passa pelos middlewares da web.
Route::fallback(NotFoundController::class);
