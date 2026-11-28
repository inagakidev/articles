<?php

/*
 * Cabeçalhos de segurança (D93).
 */

test('toda página sai com os cabeçalhos de segurança', function () {
    $response = $this->get(route('home'))->assertOk();

    $response->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // Fora de produção e sem HTTPS, sem HSTS
    $response->assertHeaderMissing('Strict-Transport-Security');
});

test('a CSP libera só os scripts da página, pelo nonce', function () {
    $response = $this->get(route('home'));
    $csp = $response->headers->get('Content-Security-Policy-Report-Only');

    preg_match("/'nonce-([^']+)'/", (string) $csp, $nonce);

    expect($csp)->toContain("frame-ancestors 'none'")
        ->and($csp)->toContain("object-src 'none'")
        ->and($nonce)->toHaveCount(2)
        ->and($response->getContent())->toContain('<script nonce="'.$nonce[1].'"');
});

test('em produção com HTTPS, o navegador passa a exigir HTTPS (HSTS)', function () {
    app()->detectEnvironment(fn () => 'production');

    $this->get('https://localhost/')
        ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
});
