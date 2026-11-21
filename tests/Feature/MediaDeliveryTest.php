<?php

/*
 * Entrega das imagens pelo R2 (D53): URL pré-assinada, estável dentro da
 * hora para o navegador reaproveitar o cache, sem consultar o bucket antes.
 * A assinatura é calculada localmente, então o teste não usa a rede.
 */

const AVATAR = 'avatars/9b91cf5b-27c9-4d7a-9856-50a7e06e842f.webp';

beforeEach(function () {
    config([
        'filesystems.media' => 'r2',
        'filesystems.disks.r2' => [
            'driver' => 's3',
            'key' => 'chave-de-teste',
            'secret' => 'segredo-de-teste',
            'region' => 'auto',
            'bucket' => 'he4rt-ink-imagens',
            'endpoint' => 'https://conta-teste.r2.cloudflarestorage.com',
            'use_path_style_endpoint' => true,
        ],
    ]);

    $this->travelTo(now()->setTime(14, 10));
});

test('redireciona para a URL pré-assinada do bucket, válida por duas horas', function () {
    $response = $this->get('/media/'.AVATAR);

    $response->assertRedirect();
    $url = $response->headers->get('Location');

    expect($url)->toStartWith('https://conta-teste.r2.cloudflarestorage.com/he4rt-ink-imagens/'.AVATAR.'?')
        ->toContain('X-Amz-Signature=')
        ->toContain('X-Amz-Expires=7200')
        ->toContain('X-Amz-Date='.now()->startOfHour()->utc()->format('Ymd\THis\Z'));
});

test('dentro da mesma hora a URL é a mesma; na hora seguinte, muda', function () {
    $first = $this->get('/media/'.AVATAR)->headers->get('Location');

    $this->travelTo(now()->setTime(14, 55));
    $sameHour = $this->get('/media/'.AVATAR)->headers->get('Location');

    $this->travelTo(now()->setTime(15, 1));
    $nextHour = $this->get('/media/'.AVATAR)->headers->get('Location');

    expect($sameHour)->toBe($first)
        ->and($nextHour)->not->toBe($first);
});

test('o navegador guarda o redirecionamento até a próxima janela', function () {
    $this->travelTo(now()->setTime(14, 40));

    $this->get('/media/'.AVATAR)->assertHeader('Cache-Control', 'max-age=1200, public');
});

test('caminho fora das fotos de perfil não chega a ser assinado', function () {
    $this->get('/media/backups/banco.sql')->assertNotFound();
});
