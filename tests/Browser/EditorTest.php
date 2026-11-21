<?php

use App\Models\Article;
use App\Models\User;

/*
 * O caminho de quem escreve: o rascunho nasce no primeiro salvamento
 * automático, a URL vira a de edição e a prévia mostra o que foi digitado.
 */

it('salva sozinho o artigo novo e mostra a prévia', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $page = visit('/write')
        ->withLocale('pt-BR')
        ->type('#title', 'Filas no Laravel')
        ->wait(3)
        ->assertSee('Salvo às');

    $article = Article::query()->sole();

    expect($article->user_id)->toBe($user->id)
        ->and($article->versions()->sole()->title)->toBe('Filas no Laravel');

    $page->assertPathIs("/articles/{$article->id}/edit")
        ->click('a[href$="/preview"], button:has-text("Prévia")')
        ->wait(2)
        ->assertPathIs("/articles/{$article->id}/preview")
        ->assertSee('Filas no Laravel')
        ->assertSee('Voltar a editar');
});
