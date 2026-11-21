<?php

/*
 * As trocas de tema e de idioma usam a View Transitions API (D74). O
 * Chromium dos testes tem suporte, então aqui roda o caminho animado: a
 * troca tem de acontecer e a marca da transição tem de sair do <html>.
 *
 * A escolha de idioma fica guardada entre os testes, então quem procura os
 * botões pelo nome começa voltando para o português.
 */

function inPortuguese(mixed $page): mixed
{
    return $page->select('#idioma', 'pt_BR')->wait(1.5);
}

it('troca o idioma pelo rodapé nas páginas públicas', function (string $url, string $english) {
    visit($url)
        ->select('#idioma', 'en')
        ->wait(1.5)
        ->assertSee($english)
        ->assertScript('document.documentElement.lang', 'en')
        ->assertScript("document.documentElement.classList.contains('vt-locale')", false);
})->with([
    'apresentação' => ['/', 'From draft to live, in three steps'],
    'termos de uso' => ['/terms', 'Terms of use'],
]);

it('troca o idioma pelo botão do cabeçalho', function (string $url, string $english) {
    inPortuguese(visit($url))
        ->click('[aria-label^="Idioma"]')
        ->wait(1.5)
        ->assertSee($english)
        ->assertScript("document.documentElement.classList.contains('vt-locale')", false);
})->with([
    'apresentação' => ['/', 'From draft to live, in three steps'],
    'termos de uso' => ['/terms', 'Terms of use'],
]);

it('troca o tema pelo botão do cabeçalho e pelo rodapé', function (string $url) {
    inPortuguese(visit($url)->inLightMode())
        ->click('[aria-label^="Tema: seguir"]')
        ->click('[aria-label^="Tema: claro"]')
        ->wait(1)
        ->assertScript("document.documentElement.classList.contains('dark')", true)
        ->assertScript("document.documentElement.classList.contains('vt-theme')", false)
        ->select('#tema', 'light')
        ->wait(1)
        ->assertScript("document.documentElement.classList.contains('dark')", false);
})->with([
    'apresentação' => ['/'],
    'termos de uso' => ['/terms'],
]);
