<?php

/*
 * Cada tela pública passa pelo axe nos dois temas, nos dois idiomas e no
 * celular. Falha com qualquer violação "critical" ou "serious" (D63).
 */

$telas = [
    'início' => '/',
    'entrar' => '/login',
    'criar conta' => '/register',
    'recuperar senha' => '/forgot-password',
];

it('não tem problemas de acessibilidade no tema claro', function (string $url) {
    visit($url)->inLightMode()->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade no tema escuro', function (string $url) {
    visit($url)->inDarkMode()->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade em inglês', function (string $url) {
    visit($url)->withLocale('en-US')->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade no celular', function (string $url) {
    visit($url)->on()->mobile()->assertNoAccessibilityIssues();
})->with($telas);
