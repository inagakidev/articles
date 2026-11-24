<?php

use App\Http\Controllers\Interactions\CommentController;
use App\Http\Controllers\Interactions\FavoriteController;
use App\Http\Controllers\Interactions\LikeController;
use App\Http\Controllers\Reports\ReportController;
use Illuminate\Support\Facades\Route;

// Comentários, curtidas e favoritos: só conta confirmada participa (RF-140, D88, D89)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('articles/{article}/comments', [CommentController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('comments.store');
    Route::put('comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::delete('comments/{comment}/moderation', [CommentController::class, 'moderate'])->name('comments.moderate');

    Route::middleware('throttle:60,1')->group(function () {
        Route::post('articles/{article}/like', [LikeController::class, 'article'])->name('likes.article.store');
        Route::delete('articles/{article}/like', [LikeController::class, 'article'])->name('likes.article.destroy');
        Route::post('comments/{comment}/like', [LikeController::class, 'comment'])->name('likes.comment.store');
        Route::delete('comments/{comment}/like', [LikeController::class, 'comment'])->name('likes.comment.destroy');

        Route::post('articles/{article}/favorite', [FavoriteController::class, 'store'])->name('favorites.store');
        // Sai da lista mesmo na lixeira da autora
        Route::delete('articles/{article}/favorite', [FavoriteController::class, 'destroy'])
            ->withTrashed()
            ->name('favorites.destroy');
    });

    // Denunciar artigo, comentário ou perfil (RF-164, D91)
    Route::post('reports', [ReportController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('reports.store');

    // A lista é só de quem salvou (RF-160)
    Route::get('favoritos', [FavoriteController::class, 'index'])->name('favorites.index');
});
