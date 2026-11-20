<?php

/*
 * Cada tela pública passa pelo axe nos dois temas, nos dois idiomas e no
 * celular. Falha com qualquer violação "critical" ou "serious" (D63).
 *
 * Antes de analisar, espera a animação de entrada terminar (até ~1,1 s): no
 * meio dela o texto ainda está transparente e o axe mediria um contraste falso.
 */
const ENTRANCE_SECONDS = 1.5;

$telas = [
    'início' => '/',
    'entrar' => '/login',
    'criar conta' => '/register',
    'recuperar senha' => '/forgot-password',
];

it('não tem problemas de acessibilidade no tema claro', function (string $url) {
    visit($url)->inLightMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade no tema escuro', function (string $url) {
    visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade em inglês', function (string $url) {
    visit($url)->withLocale('en-US')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade no celular', function (string $url) {
    visit($url)->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);
