<?php

use App\Models\Article;
use App\Models\Favorite;
use App\Models\User;

/*
 * Favoritos (D89): salvar na leitura, remover na lista e desfazer.
 */

it('favorita na leitura, remove na lista e desfaz', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $article = Article::factory()->published()->create();

    visit('/artigos/'.$article->slug)
        ->withLocale('pt-BR')
        ->click('button[aria-label^="Favoritar"]:visible')
        ->wait(0.5)
        ->assertAttribute('button[aria-label^="Favoritar"]:visible', 'aria-pressed', 'true');

    expect(Favorite::query()->where('user_id', $user->id)->count())->toBe(1);

    visit('/favoritos')
        ->withLocale('pt-BR')
        ->click('button[aria-label^="Remover dos favoritos"]')
        ->wait(0.5)
        ->assertSee('Removido dos favoritos')
        ->assertSee('Nada salvo ainda')
        ->click('Desfazer')
        ->wait(0.5)
        ->assertDontSee('Nada salvo ainda');

    expect(Favorite::query()->where('user_id', $user->id)->count())->toBe(1);
});
