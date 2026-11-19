<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Browser');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/*
|--------------------------------------------------------------------------
| Servidor do Playwright
|--------------------------------------------------------------------------
|
| O plugin de navegador inicia o Playwright por "sh -c" e, ao terminar,
| encerra só o shell. No Debian e no Ubuntu (dash), o Node fica órfão e
| segura a saída do terminal e do CI. Ao fim dos testes, encerramos os
| servidores iniciados a partir desta pasta do projeto, com SIGKILL: a essa
| altura o servidor ainda espera a conexão fechar e ignora o SIGTERM.
|
*/

register_shutdown_function(function (): void {
    if (PHP_OS_FAMILY !== 'Linux' || ! function_exists('posix_kill')) {
        return;
    }

    $project = realpath(__DIR__.'/..');

    foreach (glob('/proc/[0-9]*') ?: [] as $process) {
        // argv exato: node node_modules/.bin/playwright run-server ...
        $argv = explode("\0", (string) @file_get_contents($process.'/cmdline'));
        $isPlaywrightServer = basename($argv[0]) === 'node'
            && str_ends_with($argv[1] ?? '', 'node_modules/.bin/playwright')
            && ($argv[2] ?? '') === 'run-server';

        if ($isPlaywrightServer && @readlink($process.'/cwd') === $project) {
            posix_kill((int) basename($process), SIGKILL);
        }
    }
});
