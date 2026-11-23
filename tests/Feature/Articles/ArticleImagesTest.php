<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Imagens dos artigos (RF-079 a RF-091, D52, D53, D81): enviadas pelo
 * editor, regravadas sem metadados, com tamanhos menores gerados pela fila,
 * e privadas até a versão que as usa estar no ar.
 */

beforeEach(function () {
    Storage::fake('media');
});

/** JPEG de teste com um bloco EXIF que não pode sobreviver ao envio. */
function articlePhoto(int $width = 2000, int $height = 1200): UploadedFile
{
    $image = imagecreatetruecolor($width, $height);
    imagefill($image, 0, 0, imagecolorallocate($image, 191, 226, 255));
    ob_start();
    imagejpeg($image);
    $jpeg = (string) ob_get_clean();

    $payload = "Exif\0\0".'MODELO-DO-CELULAR';
    $app1 = "\xFF\xE1".pack('n', strlen($payload) + 2).$payload;
    $path = tempnam(sys_get_temp_dir(), 'artigo').'.jpg';
    file_put_contents($path, substr($jpeg, 0, 2).$app1.substr($jpeg, 2));

    return new UploadedFile($path, 'diagrama.jpg', 'image/jpeg', null, true);
}

/** @return array{0: User, 1: Article, 2: ArticleVersion} */
function draftWithAuthor(): array
{
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    $draft = ArticleVersion::factory()->for($article)->create();

    return [$user, $article, $draft];
}

function imageDoc(string ...$ids): array
{
    return ['type' => 'doc', 'content' => array_map(
        fn (string $id) => ['type' => 'image', 'attrs' => ['id' => $id, 'alt' => 'Diagrama']],
        $ids,
    )];
}

test('a imagem enviada é regravada em WebP, sem metadados, com os tamanhos menores', function () {
    [$user, $article] = draftWithAuthor();

    $response = $this->actingAs($user)
        ->postJson(route('articles.images.store', $article), ['image' => articlePhoto()])
        ->assertCreated()
        ->assertJsonStructure(['id', 'src', 'width', 'height']);

    $image = ArticleImage::query()->sole();
    $original = Storage::disk('media')->get($image->path());

    expect($response->json('id'))->toBe($image->uuid)
        ->and($image->article_id)->toBe($article->id)
        ->and([$image->width, $image->height])->toBe([2000, 1200])
        ->and(substr($original, 8, 4))->toBe('WEBP')
        ->and($original)->not->toContain('MODELO-DO-CELULAR')
        ->and($image->variants)->toBe([480, 960, 1600]);

    foreach ([480, 960, 1600] as $width) {
        expect(getimagesizefromstring(Storage::disk('media')->get($image->path($width)))[0])->toBe($width);
    }
});

test('imagem pequena não é aumentada', function () {
    [$user, $article] = draftWithAuthor();

    $this->actingAs($user)->postJson(route('articles.images.store', $article), ['image' => articlePhoto(800, 600)]);

    expect(ArticleImage::query()->sole()->variants)->toBe([480]);
});

test('só JPG, PNG e WebP, até 10 MB', function (UploadedFile $file) {
    [$user, $article] = draftWithAuthor();

    $this->actingAs($user)
        ->postJson(route('articles.images.store', $article), ['image' => $file])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');

    expect(ArticleImage::query()->count())->toBe(0);
})->with([
    'GIF' => fn () => UploadedFile::fake()->image('animacao.gif'),
    'SVG' => fn () => UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>'),
    'vídeo' => fn () => UploadedFile::fake()->create('aula.mp4', 500, 'video/mp4'),
    'maior que 10 MB' => fn () => UploadedFile::fake()->image('grande.jpg')->size(10 * 1024 + 1),
]);

test('só quem escreveu envia imagem para o artigo', function () {
    [, $article] = draftWithAuthor();

    $this->actingAs(User::factory()->create())
        ->postJson(route('articles.images.store', $article), ['image' => articlePhoto()])
        ->assertForbidden();
});

test('o rascunho guarda as imagens do texto e a capa, e liga a versão a elas', function () {
    [$user, $article, $draft] = draftWithAuthor();
    [$a, $b, $cover] = ArticleImage::factory()->for($article)->count(3)->create()->all();

    $this->actingAs($user)->putJson(route('articles.draft.update', $article), [
        'content' => imageDoc($a->uuid, $b->uuid, $a->uuid),
        'cover_image' => $cover->uuid,
        'cover_alt' => 'Fila de jobs',
    ])->assertOk();

    $draft->refresh();

    expect($draft->cover_image_id)->toBe($cover->id)
        ->and($draft->cover_alt)->toBe('Fila de jobs')
        ->and($draft->images()->pluck('article_images.id')->sort()->values()->all())
        ->toBe(collect([$a->id, $b->id, $cover->id])->sort()->values()->all());

    // Tirar a capa e uma imagem do texto desfaz a ligação
    $this->actingAs($user)->putJson(route('articles.draft.update', $article), [
        'content' => imageDoc($a->uuid),
        'cover_image' => null,
    ])->assertOk();

    expect($draft->fresh()->cover_image_id)->toBeNull()
        ->and($draft->images()->pluck('article_images.id')->all())->toBe([$a->id]);
});

test('imagem de outro artigo e mais de cinco imagens são recusadas', function (Closure $content, string $message) {
    [$user, $article] = draftWithAuthor();
    $own = ArticleImage::factory()->for($article)->count(6)->create();
    $foreign = ArticleImage::factory()->create();

    $this->actingAs($user)
        ->withHeader('Accept-Language', 'pt-BR')
        ->putJson(route('articles.draft.update', $article), ['content' => $content($own, $foreign)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['content' => $message]);
})->with([
    'de outro artigo' => [fn ($own, $foreign) => imageDoc($foreign->uuid), 'não pertence'],
    'seis imagens' => [fn ($own) => imageDoc(...$own->pluck('uuid')), 'até 5 imagens'],
]);

test('capa de outro artigo é recusada', function () {
    [$user, $article] = draftWithAuthor();

    $this->actingAs($user)
        ->putJson(route('articles.draft.update', $article), ['cover_image' => ArticleImage::factory()->create()->uuid])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('cover_image');
});

test('imagem de rascunho só é vista pelo autor e pela administradora (RF-090)', function () {
    [$user, $article, $draft] = draftWithAuthor();
    $image = ArticleImage::factory()->for($article)->create();
    $draft->images()->attach($image);
    Storage::disk('media')->put($image->path(), 'webp');
    $url = '/media/'.$image->path();

    $this->get($url)->assertNotFound();
    $this->actingAs(User::factory()->create())->get($url)->assertNotFound();
    $this->actingAs(User::factory()->admin()->create())->get($url)->assertOk();
    $this->actingAs($user)->get($url)
        ->assertOk()
        ->assertHeader('Cache-Control', 'max-age=300, private');
});

test('imagem da versão em vigor é pública; o tamanho ainda não gerado cai no original', function () {
    $article = Article::factory()->published()->create();
    $image = ArticleImage::factory()->for($article)->create(['variants' => [480]]);
    $article->currentVersion->images()->attach($image);
    Storage::disk('media')->put($image->path(), 'original');
    Storage::disk('media')->put($image->path(480), 'pequena');

    $this->get('/media/'.$image->path(480))->assertOk()->assertHeader('Cache-Control', 'immutable, max-age=31536000, public');
    expect($this->get('/media/'.$image->path(960))->streamedContent())->toBe('original');

    // Despublicado ou na lixeira, volta a ser privada
    $article->forceFill(['state' => ArticleState::Unpublished])->save();
    auth()->logout();
    $this->get('/media/'.$image->path())->assertNotFound();
});

test('editar artigo publicado copia a capa e as imagens, sem duplicar arquivos', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->published()->create();
    $current = $article->currentVersion;
    $image = ArticleImage::factory()->for($article)->create();
    $current->forceFill(['cover_image_id' => $image->id, 'cover_alt' => 'Capa', 'content' => imageDoc($image->uuid)])->save();
    $current->images()->attach($image);

    $this->actingAs($user)->get(route('articles.edit', $article))
        ->assertInertia(fn (Assert $page) => $page
            ->where('draft.cover.id', $image->uuid)
            ->where('draft.cover.alt', 'Capa')
            ->has('images.'.$image->uuid),
        );

    $draft = $article->versions()->where('status', VersionStatus::Draft)->sole();

    expect($draft->cover_image_id)->toBe($image->id)
        ->and($draft->images()->pluck('article_images.id')->all())->toBe([$image->id])
        ->and(ArticleImage::query()->count())->toBe(1);
});

test('a prévia mostra a capa e as imagens com texto alternativo e legenda', function () {
    [$user, $article, $draft] = draftWithAuthor();
    $image = ArticleImage::factory()->for($article)->create(['variants' => [480, 960]]);
    $cover = ArticleImage::factory()->for($article)->create();
    $draft->forceFill([
        'content' => ['type' => 'doc', 'content' => [['type' => 'image', 'attrs' => ['id' => $image->uuid, 'alt' => 'Diagrama da fila', 'caption' => 'Figura 1']]]],
        'cover_image_id' => $cover->id,
        'cover_decorative' => true,
    ])->save();
    $draft->images()->attach([$image->id, $cover->id]);

    $this->actingAs($user)->get(route('articles.preview', $article))
        ->assertInertia(fn (Assert $page) => $page
            ->where('article.cover.alt', '')
            ->where('article.cover.src', '/media/'.$cover->path())
            ->where('article.html', fn (string $html) => str_contains($html, 'alt="Diagrama da fila"')
                && str_contains($html, '<figcaption>Figura 1</figcaption>')
                && str_contains($html, '/media/'.$image->path(480).' 480w')),
        );
});

test('imagem sem versão que a use some depois de 24 horas, com os arquivos', function () {
    [, $article, $draft] = draftWithAuthor();
    [$unused, $used, $cover, $recent] = ArticleImage::factory()->for($article)->count(4)->create(['created_at' => now()->subHours(25)])->all();
    $recent->forceFill(['created_at' => now()->subHours(23)])->save();
    $draft->forceFill(['cover_image_id' => $cover->id])->save();
    $draft->images()->attach([$used->id, $cover->id]);

    foreach ([$unused, $used, $cover, $recent] as $image) {
        Storage::disk('media')->put($image->path(), 'original');
        Storage::disk('media')->put($image->path(480), 'pequena');
    }

    $this->artisan('model:prune', ['--model' => [ArticleImage::class]])->assertSuccessful();

    expect(ArticleImage::query()->pluck('id')->sort()->values()->all())
        ->toBe(collect([$used->id, $cover->id, $recent->id])->sort()->values()->all())
        ->and(Storage::disk('media')->exists($unused->path()))->toBeFalse()
        ->and(Storage::disk('media')->exists($unused->path(480)))->toBeFalse()
        ->and(Storage::disk('media')->exists($used->path()))->toBeTrue();
});

test('apagar o artigo de vez apaga os arquivos das imagens', function () {
    [, $article] = draftWithAuthor();
    $image = ArticleImage::factory()->for($article)->create();
    Storage::disk('media')->put($image->path(), 'original');

    $article->delete();
    expect(Storage::disk('media')->exists($image->path()))->toBeTrue();

    $article->forceDelete();
    expect(Storage::disk('media')->exists($image->path()))->toBeFalse()
        ->and(ArticleImage::query()->count())->toBe(0);
});

test('imagem com resolução acima de 50 megapixels é recusada', function () {
    [$user, $article] = draftWithAuthor();

    $this->actingAs($user)
        ->postJson(route('articles.images.store', $article), ['image' => UploadedFile::fake()->image('panorama.png', 10_000, 5_001)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');
});
