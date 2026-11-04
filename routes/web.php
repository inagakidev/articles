<?php

use App\Http\Controllers\ArticleController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/articles')->name('home');

Route::get('/articles', [ArticleController::class, 'index'])
    ->name('articles.index');

require __DIR__.'/settings.php';
