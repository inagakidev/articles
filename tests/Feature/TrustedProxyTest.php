<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
 * Proxies confiáveis (config/trustedproxy.php): só os listados em
 * TRUSTED_PROXIES dizem à aplicação que a visita veio por https.
 */

beforeEach(function () {
    Route::get('/_esquema', fn (Request $request) => $request->getScheme().'://'.$request->getHost());
});

test('sem proxy confiável, o cabeçalho de https é ignorado', function () {
    config(['trustedproxy.proxies' => null]);

    $this->withHeaders(['X-Forwarded-Proto' => 'https', 'X-Forwarded-Host' => 'previa.exemplo.dev'])
        ->get('/_esquema')
        ->assertSee('http://localhost');
});

test('atrás de um proxy confiável, vale o https e o endereço que ele informa', function () {
    config(['trustedproxy.proxies' => '127.0.0.1,::1']);

    $this->withHeaders(['X-Forwarded-Proto' => 'https', 'X-Forwarded-Host' => 'previa.exemplo.dev'])
        ->get('/_esquema')
        ->assertSee('https://previa.exemplo.dev');
});
