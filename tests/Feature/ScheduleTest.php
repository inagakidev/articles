<?php

use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** As rotinas de routes/console.php, como o comando que o agendador roda. */
function scheduledCommands(): array
{
    // Carrega routes/console.php, como faz o `schedule:run`.
    Artisan::call('list');

    return collect(app(Schedule::class)->events())
        ->mapWithKeys(fn (Event $event) => [
            Str::after($event->command, "'artisan' ") => $event->expression,
        ])
        ->all();
}

test('as rotinas de limpeza rodam todo dia', function () {
    expect(scheduledCommands())->toMatchArray([
        'auth:clear-resets' => '0 0 * * *',
        'queue:prune-failed --hours=168' => '0 0 * * *',
        'model:prune' => '0 0 * * *',
    ]);
});

test('jobs com falha são apagados depois de 7 dias', function () {
    $failedJob = fn (int $daysAgo) => DB::table('failed_jobs')->insert([
        'uuid' => (string) Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'teste',
        'failed_at' => now()->subDays($daysAgo),
    ]);

    $failedJob(8);
    $failedJob(6);

    $prune = collect(scheduledCommands())
        ->keys()
        ->first(fn (string $command) => str_starts_with($command, 'queue:prune-failed'));

    Artisan::call($prune);

    expect(DB::table('failed_jobs')->count())->toBe(1)
        ->and(DB::table('failed_jobs')->value('failed_at'))
        ->toBeGreaterThan(now()->subDays(7)->toDateTimeString());
});
