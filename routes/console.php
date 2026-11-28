<?php

use App\Domain\Moderation\Actions\EndExpiredSuspensions;
use Illuminate\Support\Facades\Schedule;

// Links de recuperação de senha vencidos.
Schedule::command('auth:clear-resets')->daily();

// Jobs com falha guardam o conteúdo, inclusive o e-mail da pessoa
// (REQUIREMENTS.md §2.23: 7 dias).
Schedule::command('queue:prune-failed', ['--hours' => 7 * 24])->daily();

// Registros com prazo de retenção (REQUIREMENTS.md §2.23), definidos no
// método prunable() de cada modelo.
Schedule::command('model:prune')->daily();

// Fim automático da suspensão e retomada dos prazos pausados (RF-217).
Schedule::call(fn () => app(EndExpiredSuspensions::class)->handle())->everyMinute();
