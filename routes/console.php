<?php

use Illuminate\Support\Facades\Schedule;

// Links de recuperação de senha vencidos.
Schedule::command('auth:clear-resets')->daily();

// Jobs com falha guardam o conteúdo, inclusive o e-mail da pessoa
// (REQUIREMENTS.md §2.23: 7 dias).
Schedule::command('queue:prune-failed', ['--hours' => 7 * 24])->daily();
