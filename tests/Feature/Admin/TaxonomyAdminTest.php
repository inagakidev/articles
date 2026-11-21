<?php

use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * "Categorias e tags" no painel (RF-124 a RF-129, RF-251).
 */

beforeEach(function () {
    $this->admin = User::factory()->admin()->withTwoFactor()->create();
});

test('só a administradora entra e mexe em categorias e tags', function (string $method, Closure $url) {
    $tag = Tag::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs(User::factory()->withTwoFactor()->create())
        ->{$method}($url($category, $tag), [])
        ->assertForbidden();
})->with([
    'ver' => ['get', fn () => route('admin.taxonomy')],
    'criar' => ['post', fn () => route('admin.categories.store')],
    'renomear' => ['put', fn (Category $category) => route('admin.categories.update', $category)],
    'excluir categoria' => ['delete', fn (Category $category) => route('admin.categories.destroy', $category)],
    'bloquear' => ['post', fn ($category, Tag $tag) => route('admin.tags.block', $tag)],
    'unir' => ['post', fn ($category, Tag $tag) => route('admin.tags.merge', $tag)],
    'excluir tag' => ['delete', fn ($category, Tag $tag) => route('admin.tags.destroy', $tag)],
]);

test('mostra as categorias com o uso e as tags com estado e sugestão de união', function () {
    $mobile = Category::query()->where('slug', 'mobile')->sole();
    $react = Tag::factory()->create(['name' => 'react']);
    $reactjs = Tag::factory()->create(['name' => 'reactjs']);
    Tag::factory()->blocked()->create(['name' => 'ganhe-dinheiro']);
    foreach ([[$react, $reactjs], [$react]] as $tags) {
        $version = ArticleVersion::factory()->create(['category_id' => $mobile->id]);
        $version->tags()->attach(collect($tags)->pluck('id'));
    }

    $this->actingAs($this->admin)
        ->get(route('admin.taxonomy'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/taxonomy')
            ->has('categories', 10)
            ->where('categories', fn ($categories) => collect($categories)->firstWhere('id', $mobile->id)['articles'] === 2)
            ->has('tags.data', 3)
            ->where('tags.data.0.name', 'react')
            ->where('tags.data.0.mergeInto', null)
            ->where('tags.data.1.name', 'reactjs')
            ->where('tags.data.1.mergeInto', ['id' => $react->id, 'name' => 'react'])
            ->where('tags.data.2.blocked', true),
        );
});

test('a busca de tag usa a forma normalizada', function () {
    Tag::factory()->create(['name' => 'kubernetes']);
    Tag::factory()->create(['name' => 'laravel']);

    $this->actingAs($this->admin)
        ->get(route('admin.taxonomy', ['tag' => 'Kubernetes']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tags.data', 1)
            ->where('tags.data.0.name', 'kubernetes')
            ->where('search', 'Kubernetes'),
        );
});

test('cria e renomeia com os dois nomes, sem repetir, e com uma cor válida', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), ['name_pt_br' => 'Inteligência artificial', 'name_en' => 'Artificial intelligence', 'color' => 'mint'])
        ->assertRedirect(route('admin.taxonomy'));

    $category = Category::query()->where('slug', 'inteligencia-artificial')->sole();

    $this->actingAs($this->admin)
        ->put(route('admin.categories.update', $category), ['name_pt_br' => 'IA', 'name_en' => 'AI', 'color' => 'pink'])
        ->assertSessionHasNoErrors();

    expect($category->fresh())
        ->name_pt_br->toBe('IA')
        ->slug->toBe('inteligencia-artificial');

    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), ['name_pt_br' => 'Back-end', 'name_en' => '', 'color' => 'roxo'])
        ->assertSessionHasErrors(['name_pt_br', 'name_en', 'color']);
});

test('excluir pela tela transfere os artigos', function () {
    [$from, $to] = Category::factory()->count(2)->create();
    ArticleVersion::factory()->create(['category_id' => $from->id]);

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $from))
        ->assertSessionHasErrors('transfer_to');

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $from), ['transfer_to' => $to->id])
        ->assertRedirect(route('admin.taxonomy'));

    expect($from->fresh())->toBeNull()
        ->and(ArticleVersion::query()->where('category_id', $to->id)->count())->toBe(1);
});

test('bloqueia, desbloqueia, une e exclui tags', function () {
    $react = Tag::factory()->create(['name' => 'react']);
    $reactjs = Tag::factory()->create(['name' => 'reactjs']);
    $version = ArticleVersion::factory()->create();
    $version->tags()->attach($reactjs->id);

    $this->actingAs($this->admin)->post(route('admin.tags.block', $react));
    expect($react->fresh()->isBlocked())->toBeTrue();

    $this->actingAs($this->admin)->delete(route('admin.tags.unblock', $react));
    expect($react->fresh()->isBlocked())->toBeFalse();

    $this->actingAs($this->admin)->post(route('admin.tags.merge', $reactjs), ['target_id' => $react->id]);
    expect($version->tags()->pluck('name')->all())->toBe(['react']);

    $this->actingAs($this->admin)->delete(route('admin.tags.destroy', $react));
    expect($react->fresh())->toBeNull()
        ->and($version->tags()->count())->toBe(0);
});

test('a landing mostra as categorias no idioma da página', function () {
    $this->withHeader('Accept-Language', 'en')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories', 10)
            ->where('categories.3', ['name' => 'Databases', 'color' => 'yellow']),
        );
});

test('artigo na lixeira continua contando no uso da categoria', function () {
    $category = Category::factory()->create();
    $version = ArticleVersion::factory()->create(['category_id' => $category->id]);
    Article::query()->find($version->article_id)->delete();

    $this->actingAs($this->admin)
        ->get(route('admin.taxonomy'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories', fn ($categories) => collect($categories)->firstWhere('id', $category->id)['articles'] === 1),
        );
});

test('guardar o nome guarda a chave aproximada da tag', function () {
    expect(Tag::factory()->create(['name' => 'react-js'])->loose_key)->toBe('react');
});

test('a sugestão aparece também para tags de outras páginas', function () {
    Tag::factory()->count(30)->create();
    $react = Tag::factory()->create(['name' => 'react']);
    $reactjs = Tag::factory()->create(['name' => 'reactjs']);
    $version = ArticleVersion::factory()->create();
    $version->tags()->attach($react->id);

    $suggestion = collect(range(1, 2))
        ->flatMap(fn (int $page) => $this->actingAs($this->admin)
            ->get(route('admin.taxonomy', ['page' => $page]))
            ->viewData('page')['props']['tags']['data'])
        ->firstWhere('name', 'reactjs')['mergeInto'];

    expect($suggestion)->toBe(['id' => $react->id, 'name' => 'react']);
});

test('o custo da tela não cresce com o total de tags', function () {
    $queries = function () {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->actingAs($this->admin)->get(route('admin.taxonomy'))->assertOk();
        DB::disableQueryLog();

        return count(DB::getQueryLog());
    };

    Tag::factory()->count(30)->create();
    $few = $queries();

    Tag::factory()->count(300)->create();
    $many = $queries();

    expect($many)->toBe($few);
});
