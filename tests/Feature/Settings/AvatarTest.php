<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/*
 * Foto de perfil (RF-026, RF-032, RF-033): regravada em WebP, sem metadados
 * (D52), no disco de mídia e servida pela rota da aplicação (D53).
 */

beforeEach(function () {
    Storage::fake('media');
});

/** JPEG de teste com um bloco EXIF, para conferir que ele some. */
function photoWithExif(int $width = 800, int $height = 600): UploadedFile
{
    $image = imagecreatetruecolor($width, $height);
    imagefill($image, 0, 0, imagecolorallocate($image, 135, 92, 203));
    ob_start();
    imagejpeg($image);
    $jpeg = (string) ob_get_clean();

    // APP1 com "Exif" e um texto que não pode sobreviver ao processamento.
    $payload = "Exif\0\0".'GPS-LATITUDE-SECRETA';
    $app1 = "\xFF\xE1".pack('n', strlen($payload) + 2).$payload;
    $path = tempnam(sys_get_temp_dir(), 'foto').'.jpg';
    file_put_contents($path, substr($jpeg, 0, 2).$app1.substr($jpeg, 2));

    return new UploadedFile($path, 'foto.jpg', 'image/jpeg', null, true);
}

test('troca a foto: quadrada, em WebP e sem os metadados', function () {
    $user = User::factory()->create();
    $upload = photoWithExif();

    expect(file_get_contents($upload->getRealPath()))->toContain('GPS-LATITUDE-SECRETA');

    $this->actingAs($user)
        ->post(route('avatar.update'), ['avatar' => $upload])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $path = $user->fresh()->avatar_path;
    $stored = Storage::disk('media')->get($path);

    expect($path)->toMatch('#^avatars/[0-9a-f-]{36}\.webp$#')
        ->and(substr($stored, 0, 4))->toBe('RIFF')
        ->and(substr($stored, 8, 4))->toBe('WEBP')
        ->and($stored)->not->toContain('GPS-LATITUDE-SECRETA')
        ->and(getimagesizefromstring($stored))->toMatchArray([0 => 512, 1 => 512]);
});

test('trocar de novo apaga a foto anterior', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => photoWithExif()]);
    $first = $user->fresh()->avatar_path;

    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => photoWithExif()]);

    Storage::disk('media')->assertMissing($first);
    Storage::disk('media')->assertExists($user->fresh()->avatar_path);
});

test('recusa formato fora da lista e imagem pequena demais', function (UploadedFile $file) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('avatar.update'), ['avatar' => $file])
        ->assertSessionHasErrors('avatar');

    expect($user->fresh()->avatar_path)->toBeNull();
})->with([
    'gif' => fn () => UploadedFile::fake()->image('foto.gif', 200, 200),
    'pdf' => fn () => UploadedFile::fake()->create('foto.pdf', 10, 'application/pdf'),
    'pequena' => fn () => UploadedFile::fake()->image('foto.png', 40, 40),
    'grande demais' => fn () => UploadedFile::fake()->image('foto.jpg', 200, 200)->size(10 * 1024 + 1),
]);

test('remover volta às iniciais e apaga o arquivo', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => photoWithExif()]);
    $path = $user->fresh()->avatar_path;

    $this->actingAs($user)->delete(route('avatar.destroy'))->assertRedirect(route('profile.edit'));

    expect($user->fresh()->avatar_path)->toBeNull()
        ->and($user->fresh()->avatar)->toBeNull();
    Storage::disk('media')->assertMissing($path);
});

test('a rota de mídia entrega a foto, que é pública, com cache longo', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => photoWithExif()]);
    auth()->logout();

    $this->get($user->fresh()->avatar)
        ->assertOk()
        ->assertHeader('Cache-Control', 'immutable, max-age=31536000, public');
});

test('arquivo fora das fotos de perfil não sai pela rota de mídia', function (string $path) {
    Storage::disk('media')->put('backups/banco.sql', 'segredo');
    Storage::disk('media')->put('avatars/nao-e-uuid.webp', 'x');

    $this->get('/media/'.$path)->assertNotFound();
})->with(['backups/banco.sql', 'avatars/nao-e-uuid.webp', '../.env', 'avatars/00000000-0000-0000-0000-000000000000.webp']);

test('visitante não envia foto', function () {
    $this->post(route('avatar.update'), ['avatar' => photoWithExif()])->assertRedirect(route('login'));
});
