<?php

use App\Http\Controllers\Articles\ArticleImageController;
use App\Http\Controllers\Articles\DraftController;
use App\Http\Controllers\Articles\EditorController;
use App\Http\Controllers\Articles\PreviewController;
use Illuminate\Support\Facades\Route;

// Escrever e editar (RF-301, RF-302, D80): só conta confirmada (RF-014)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('write', [EditorController::class, 'create'])->name('articles.create');
    Route::get('articles/{article}/edit', [EditorController::class, 'edit'])->name('articles.edit');
    Route::get('articles/{article}/preview', PreviewController::class)->name('articles.preview');

    // Salvamento automático do rascunho (RF-071), em JSON
    Route::middleware('throttle:120,1')->group(function () {
        Route::post('articles', [DraftController::class, 'store'])->name('articles.store');
        Route::put('articles/{article}/draft', [DraftController::class, 'update'])->name('articles.draft.update');
    });

    // Imagens do artigo (RF-082), em JSON
    Route::post('articles/{article}/images', [ArticleImageController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('articles.images.store');
});
