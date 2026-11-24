<?php

use App\Models\Article;
use App\Models\User;

/*
 * Comentários na leitura (D88): o campo abre ao focar e o comentário
 * publicado entra destacado.
 */

it('publica pelo atalho e destaca o comentário novo por um instante', function () {
    $this->actingAs(User::factory()->create());
    $article = Article::factory()->published()->create();

    visit('/artigos/'.$article->slug)
        ->withLocale('pt-BR')
        ->assertSee('Seja a primeira pessoa a comentar')
        ->click('#novo-comentario')
        ->type('#novo-comentario', 'Gostei muito')
        ->keys('#novo-comentario', ['Control+Enter'])
        ->wait(0.3)
        ->assertPresent('li.comment-new')
        ->assertSee('agora')
        ->wait(3)
        ->assertMissing('li.comment-new');
});
