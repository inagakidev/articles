<?php

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Favorite;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

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
    'nova senha' => '/reset-password/token?email=lia%40exemplo.dev',
    'termos de uso' => '/terms',
    'política de privacidade' => '/privacy',
    'política de conteúdo com item destacado' => '/content-policy?item=4.2',
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

it('não tem problemas de acessibilidade nas telas de confirmação de e-mail', function (bool $verified, string $url) {
    $user = User::factory()->state(['email_verified_at' => $verified ? now() : null])->create();
    $this->actingAs($user);

    visit($url)->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with([
    'confira seu e-mail' => [false, '/email/verify'],
    'e-mail confirmado' => [true, '/email/confirmed'],
]);

it('não tem problemas de acessibilidade no novo aceite das políticas', function () {
    $this->actingAs(User::factory()->withoutAcceptedPolicies()->create());

    visit('/policies/accept')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/policies/accept')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no painel da administração', function () {
    $this->actingAs(User::factory()->admin()->withTwoFactor()->create());

    visit('/admin')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin')->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade na confirmação de senha e na ativação do 2FA', function () {
    // Telas do 2FA ligado (D75); hoje ele fica desligado (D84).
    config(['auth.admin_two_factor' => true]);
    $this->actingAs(User::factory()->admin()->create());

    visit('/admin')
        ->withLocale('pt-BR')
        ->wait(ENTRANCE_SECONDS)
        ->assertNoAccessibilityIssues()
        ->type('password', 'password')
        ->press('Confirmar')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Proteja o painel')
        ->assertNoAccessibilityIssues()
        ->press('Ativar agora')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Escaneie o QR code')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no código do 2FA ao entrar', function () {
    // Telas do 2FA ligado (D75); hoje ele fica desligado (D84).
    config(['auth.admin_two_factor' => true]);
    $admin = User::factory()->admin()->withTwoFactor()->create();

    visit('/login')
        ->withLocale('pt-BR')
        ->type('email', $admin->email)
        ->type('password', 'password')
        ->click('button[type="submit"]')
        ->wait(3)
        ->assertSee('Verificação em duas etapas')
        ->assertNoAccessibilityIssues()
        ->press('Usar um código de recuperação')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade nas configurações', function () {
    $this->actingAs(User::factory()->create([
        'bio' => 'Front-end com foco em acessibilidade.',
        'pending_email' => 'nova@exemplo.dev',
        'pending_email_expires_at' => now()->addHours(10),
    ]));

    foreach (['/settings/profile', '/settings/appearance'] as $url) {
        visit($url)->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    }

    visit('/settings/security')
        ->withLocale('pt-BR')
        ->type('password', 'password')
        ->click('button[type="submit"]')
        ->wait(3)
        ->assertSee('Troca de e-mail pendente')
        ->assertNoAccessibilityIssues()
        ->press('Alterar senha')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no perfil público', function () {
    User::factory()->create(['username' => 'rafa-moreira', 'bio' => 'Dev back-end.']);

    visit('/@rafa-moreira')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/@rafa-moreira')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/@rafa-moreira')->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade em categorias e tags', function () {
    $this->actingAs(User::factory()->admin()->withTwoFactor()->create());
    Tag::factory()->create(['name' => 'react']);
    Tag::factory()->create(['name' => 'reactjs']);
    Tag::factory()->blocked()->create(['name' => 'ganhe-dinheiro']);

    visit('/admin/taxonomy')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin/taxonomy')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin/taxonomy')->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin/taxonomy')
        ->withLocale('pt-BR')
        ->click('[aria-label="Excluir Mobile"]')
        ->wait(1)
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no editor e na prévia', function () {
    Storage::fake('media');
    $user = User::factory()->create();
    $this->actingAs($user);
    $article = Article::factory()->for($user, 'author')->create();
    [$figure, $cover] = ArticleImage::factory()->for($article)->count(2)->create(['width' => 2, 'height' => 1])->all();
    $pixel = (string) base64_decode('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAUAmJaQAA3AA/vuUAAA=');
    Storage::disk('media')->put($figure->path(), $pixel);
    Storage::disk('media')->put($cover->path(), $pixel);
    $version = ArticleVersion::factory()->for($article)->create([
        'title' => 'Filas no Laravel',
        'cover_image_id' => $cover->id,
        'cover_alt' => 'Fila de jobs',
        'category_id' => Category::query()->value('id'),
        'content' => ['type' => 'doc', 'content' => [
            ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'Quem tira o job']]],
            ['type' => 'paragraph', 'content' => [
                ['type' => 'text', 'text' => 'Um texto com '],
                ['type' => 'text', 'text' => 'destaque', 'marks' => [['type' => 'highlight', 'attrs' => ['color' => 'amarelo']]]],
                ['type' => 'text', 'text' => ' e '],
                ['type' => 'text', 'text' => 'link', 'marks' => [['type' => 'link', 'attrs' => ['href' => 'https://laravel.com']]]],
            ]],
            ['type' => 'codeBlock', 'attrs' => ['language' => 'php'], 'content' => [['type' => 'text', 'text' => "// fila\ndispatch(new SendInvoice(\$order));"]]],
            // Sem texto alternativo: o editor mostra o erro, que também passa pelo axe
            ['type' => 'image', 'attrs' => ['id' => $figure->uuid, 'caption' => 'Figura 1']],
        ]],
    ]);
    $version->images()->attach([$figure->id, $cover->id]);

    foreach (['/write', "/articles/{$article->id}/edit", "/articles/{$article->id}/preview"] as $url) {
        visit($url)->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    }
});

it('não tem problemas de acessibilidade em Meus artigos e na Lixeira', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    foreach ([VersionStatus::Draft, VersionStatus::Pending, VersionStatus::Rejected] as $status) {
        ArticleVersion::factory()->for(Article::factory()->for($user, 'author'))->create([
            'status' => $status,
            'submitted_at' => now()->subHour(),
            'decided_at' => $status === VersionStatus::Rejected ? now() : null,
            'decision_reason' => $status === VersionStatus::Rejected ? 'Faltam as fontes.' : null,
        ]);
    }

    $published = Article::factory()->for($user, 'author')->published()->create();
    ArticleVersion::factory()->for($published)->create(['status' => VersionStatus::Pending, 'submitted_at' => now()]);
    ArticleVersion::factory()->for(Article::factory()->for($user, 'author'))->create()->article->delete();

    foreach (['/my-articles', '/my-articles/trash'] as $url) {
        visit($url)->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    }
});

it('não tem problemas de acessibilidade em Meus artigos vazio', function () {
    $this->actingAs(User::factory()->create());

    visit('/my-articles')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/my-articles')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade na listagem, na leitura e no 404', function (string $url, string $mode) {
    $category = Category::query()->firstOrFail();
    $articles = Article::factory()->published()->count(13)->create();
    $article = $articles->first();
    ArticleVersion::query()->whereKey($article->current_version_id)->update([
        'category_id' => $category->id,
        'decided_at' => now()->addDay(),
        'content' => ['type' => 'doc', 'content' => [
            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Quando comecei com filas no Laravel.']]],
            ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'Quem tira o job da fila']]],
            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'O worker, um processo de longa duração.']]],
            ['type' => 'codeBlock', 'attrs' => ['language' => 'php'], 'content' => [['type' => 'text', 'text' => 'php artisan queue:work']]],
        ]],
    ]);
    $page = visit(str_replace('{slug}', (string) $article->slug, $url));

    $page = match ($mode) {
        'escuro' => $page->inDarkMode(),
        'inglês' => $page->withLocale('en-US'),
        'celular' => $page->on()->mobile(),
        default => $page,
    };

    $page->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with([
    'início com artigos' => '/',
    'listagem' => '/artigos',
    'listagem, página 2' => '/artigos?page=2',
    'leitura' => '/artigos/{slug}',
    '404' => '/nada-por-aqui',
])->with(['claro', 'escuro', 'inglês', 'celular']);

it('não tem problemas de acessibilidade na busca', function (string $url, string $mode) {
    $category = Category::query()->firstOrFail();
    $article = Article::factory()->published()->create();
    $article->currentVersion->update(['title' => 'Concorrência em Go, do zero']);
    $article->currentVersion->tags()->attach(Tag::query()->create(['name' => 'laravel', 'loose_key' => 'laravel']));
    Article::factory()->published()->count(3)->create();
    $page = visit(str_replace('{categoria}', $category->slug, $url));

    $page = match ($mode) {
        'escuro' => $page->inDarkMode(),
        'inglês' => $page->withLocale('en-US'),
        'celular' => $page->on()->mobile(),
        default => $page,
    };

    $page->wait(ENTRANCE_SECONDS)
        ->assertSee(str_contains($url, 'kubernets') ? 'kubernets' : 'Concorrência em Go')
        ->assertNoAccessibilityIssues();
})->with([
    'com resultados e termo curto' => '/busca?q=go&tags[]=laravel',
    'sem resultados' => '/busca?q=kubernets&categoria={categoria}',
])->with(['claro', 'escuro', 'inglês', 'celular']);

it('não tem problemas de acessibilidade nos filtros da busca', function () {
    Article::factory()->published()->count(2)->create();

    visit('/busca')
        ->withLocale('pt-BR')
        ->press('Filtros')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Publicado em')
        ->assertNoAccessibilityIssues();

    visit('/busca')
        ->withLocale('pt-BR')
        ->on()->mobile()
        ->press('Filtros')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Publicado em')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no compartilhar', function () {
    $user = User::factory()->create(['username' => 'rafa-moreira']);
    $article = Article::factory()->for($user, 'author')->published()->create();

    visit('/artigos/'.$article->slug)
        ->withLocale('pt-BR')
        ->click('article .border-y button[aria-label="Compartilhar"]')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Compartilhar artigo')
        ->assertNoAccessibilityIssues();

    visit('/@rafa-moreira')
        ->withLocale('pt-BR')
        ->on()->mobile()
        ->press('Compartilhar perfil')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Link do perfil')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade na moderação', function (string $mode) {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);
    $article = Article::factory()->create();
    $version = ArticleVersion::factory()->for($article)->create([
        'status' => VersionStatus::Pending,
        'submitted_at' => now()->subHours(8),
    ]);
    ArticleVersion::factory()->for(Article::factory()->published()->create())->create([
        'status' => VersionStatus::Pending,
        'submitted_at' => now()->subHour(),
    ]);
    app(RecordAudit::class)->handle($admin, AuditAction::TagBlocked, '#spam', policyItem: '1.2', reason: 'Usada só em spam.');

    foreach (['/admin', '/admin/queue', '/admin/audit'] as $url) {
        $page = visit($url);
        $page = match ($mode) {
            'escuro' => $page->inDarkMode(),
            'celular' => $page->on()->mobile(),
            default => $page,
        };
        $page->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    }

    $review = visit('/admin/versions/'.$version->id);
    $review = match ($mode) {
        'escuro' => $review->inDarkMode(),
        'celular' => $review->on()->mobile(),
        default => $review,
    };
    $review->withLocale('pt-BR')
        ->click('Rejeitar')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Item da Política de conteúdo')
        ->assertNoAccessibilityIssues();
})->with(['claro', 'escuro', 'celular']);

it('não tem problemas de acessibilidade na moderação pela leitura', function () {
    $this->actingAs(User::factory()->admin()->create());
    $article = Article::factory()->published()->create();

    visit('/artigos/'.$article->slug)
        ->withLocale('pt-BR')
        ->press('Moderação')
        ->click('Despublicar')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Despublicar o artigo')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade nos comentários e curtidas', function (string $mode) {
    $reader = User::factory()->create(['name' => 'Lia Martins']);
    $article = Article::factory()->published()->create();
    $first = Comment::factory()->for($article)->create(['body' => 'O afterCommit me salvou.']);
    $reply = Comment::factory()->replyTo($first)->create(['user_id' => $article->user_id, 'body' => 'Esse é o cenário!']);
    Comment::factory()->replyTo($reply)->create(['user_id' => $reader->id, 'body' => 'Uso no job também.']);
    CommentLike::query()->insert(['comment_id' => $first->id, 'user_id' => $reader->id, 'created_at' => now()]);
    // Mais de uma página de conversa, para aparecer a paginação
    Comment::factory()->for($article)->count(5)->create(['created_at' => now()->addMinute()]);

    if ($mode !== 'visitante') {
        $this->actingAs($reader);
    }

    $page = visit('/artigos/'.$article->slug);
    $page = match ($mode) {
        'escuro' => $page->inDarkMode(),
        'celular' => $page->on()->mobile(),
        default => $page,
    };

    $page->wait(ENTRANCE_SECONDS)->assertSee('Uso no job também.')->assertVisible('#comentarios nav')->assertNoAccessibilityIssues();
})->with(['claro', 'escuro', 'celular', 'visitante']);

it('não tem problemas de acessibilidade nos favoritos', function (string $mode) {
    $user = User::factory()->create();
    $this->actingAs($user);

    if ($mode !== 'vazio') {
        foreach (Article::factory()->published()->count(2)->create() as $article) {
            Favorite::query()->create(['article_id' => $article->id, 'user_id' => $user->id]);
        }
        $gone = Article::factory()->published()->create();
        Favorite::query()->create(['article_id' => $gone->id, 'user_id' => $user->id]);
        $gone->delete();
    }

    $page = visit('/favoritos')->withLocale('pt-BR');
    $page = match ($mode) {
        'escuro' => $page->inDarkMode(),
        'celular' => $page->on()->mobile(),
        default => $page,
    };

    $page->wait(ENTRANCE_SECONDS)
        ->assertSee($mode === 'vazio' ? 'Nada salvo ainda' : 'Este artigo não está mais disponível')
        ->assertNoAccessibilityIssues();
})->with(['claro', 'escuro', 'celular', 'vazio']);
