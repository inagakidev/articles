<?php

use App\Http\Controllers\Notifications\NotificationController;
use Illuminate\Support\Facades\Route;

// Notificações: só as da própria pessoa (RF-179 a RF-192, D90)
Route::middleware('auth')->group(function () {
    Route::get('notificacoes', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notificacoes/{notification}', [NotificationController::class, 'open'])
        ->whereUuid('notification')
        ->name('notifications.open');

    Route::patch('notifications/read', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::delete('notifications/read', [NotificationController::class, 'clearRead'])->name('notifications.clear-read');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])
        ->whereUuid('notification')
        ->name('notifications.read');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])
        ->whereUuid('notification')
        ->name('notifications.destroy');
});
