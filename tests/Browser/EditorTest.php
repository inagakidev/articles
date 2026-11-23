<?php

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
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

it('envia o rascunho pronto e retira da fila pelo aviso', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $article = Article::factory()->for($user, 'author')->create();
    $draft = ArticleVersion::factory()->for($article)->create([
        'title' => 'Filas no Laravel',
        'category_id' => Category::query()->value('id'),
    ]);

    visit("/articles/{$article->id}/edit")
        ->withLocale('pt-BR')
        ->wait(2)
        ->assertSee('Pronto para enviar')
        ->click('Enviar para revisão')
        ->wait(3)
        ->assertPathIs('/my-articles')
        ->assertSee('“Filas no Laravel” foi enviado para revisão')
        ->assertSee('A revisão leva até 6 horas')
        ->click('[role="status"] button:has-text("Retirar da fila")')
        ->wait(2)
        ->assertSee('Versão voltou para rascunho');

    expect($draft->fresh()->status)->toBe(VersionStatus::Draft);
});
