<?php

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use Illuminate\Support\Facades\Storage;

/*
 * Retenção das versões substituídas (RF-098, REQUIREMENTS §2.23).
 */

/**
 * Substituídas do artigo, da mais antiga (aprovada há mais dias) para a
 * mais recente.
 *
 * @return list<ArticleVersion>
 */
function supersededVersions(Article $article, int $count): array
{
    return array_values(collect(range($count, 1))
        ->map(fn (int $days) => ArticleVersion::factory()->for($article)->create([
            'status' => VersionStatus::Superseded,
            'decided_at' => now()->subDays($days),
        ]))
        ->all());
}

function pruneVersions(): void
{
    test()->artisan('model:prune', ['--model' => [ArticleVersion::class]])->assertSuccessful();
}

test('guarda as cinco substituídas mais recentes e apaga as mais antigas', function () {
    $article = Article::factory()->published()->create();
    $superseded = supersededVersions($article, 7);

    pruneVersions();

    expect($article->versions()->where('status', VersionStatus::Superseded)->pluck('id')->sort()->values()->all())
        ->toBe(collect($superseded)->slice(2)->pluck('id')->values()->all());
});

test('não toca na versão em vigor, no rascunho, na pendente nem nas rejeitadas', function () {
    $article = Article::factory()->published()->create();
    supersededVersions($article, 6);
    $others = collect([VersionStatus::Draft, VersionStatus::Pending, VersionStatus::Rejected, VersionStatus::Rejected])
        ->map(fn (VersionStatus $status) => ArticleVersion::factory()->for($article)->create([
            'status' => $status,
            'decided_at' => now()->subYear(),
        ]));

    pruneVersions();

    expect(ArticleVersion::query()->whereKey($article->current_version_id)->exists())->toBeTrue()
        ->and(ArticleVersion::query()->whereKey($others->pluck('id'))->count())->toBe(4)
        ->and($article->versions()->where('status', VersionStatus::Superseded)->count())->toBe(5);
});

test('conta as cinco de cada artigo separadamente', function () {
    $many = Article::factory()->published()->create();
    $few = Article::factory()->published()->create();
    supersededVersions($many, 6);
    supersededVersions($few, 3);

    pruneVersions();

    expect($many->versions()->where('status', VersionStatus::Superseded)->count())->toBe(5)
        ->and($few->versions()->where('status', VersionStatus::Superseded)->count())->toBe(3);
});

test('a versão que partiu da apagada continua, sem a referência', function () {
    $article = Article::factory()->published()->create();
    [$oldest] = supersededVersions($article, 6);
    $current = ArticleVersion::query()->findOrFail($article->current_version_id);
    $current->forceFill(['based_on_id' => $oldest->id])->save();

    pruneVersions();

    expect($current->fresh()?->based_on_id)->toBeNull();
});

test('as imagens que só a versão apagada usava somem na limpeza de imagens', function () {
    Storage::fake('media');
    $article = Article::factory()->published()->create();
    [$oldest, $kept] = supersededVersions($article, 6);
    [$only, $shared] = ArticleImage::factory()->for($article)->count(2)->create(['created_at' => now()->subWeek()])->all();
    $oldest->images()->attach([$only->id, $shared->id]);
    $kept->images()->attach($shared->id);
    Storage::disk('media')->put($only->path(), 'original');

    pruneVersions();
    $this->artisan('model:prune', ['--model' => [ArticleImage::class]])->assertSuccessful();

    expect(ArticleImage::query()->pluck('id')->all())->toBe([$shared->id])
        ->and(Storage::disk('media')->exists($only->path()))->toBeFalse();
});
