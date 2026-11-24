<?php

use App\Http\Controllers\Interactions\CommentController;
use App\Http\Controllers\Interactions\LikeController;
use Illuminate\Support\Facades\Route;

// Comentários e curtidas: só conta confirmada participa (RF-140, D88)
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
    });
});
