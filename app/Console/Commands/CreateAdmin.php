<?php

namespace App\Console\Commands;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Domain\Accounts\Actions\CreateAdministrator;
use App\Domain\Accounts\Actions\MakeAdministrator;
use App\Domain\Accounts\Exceptions\CannotMakeAdministrator;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

/**
 * Cria a administradora da instalação ou promove uma conta que já existe
 * (RF-244, D56). A senha é sempre digitada, nunca passada como opção, para
 * não ficar no histórico do terminal.
 */
#[Signature('admin:create {email? : E-mail da administradora}')]
#[Description('Cria a administradora da instalação, ou promove uma conta existente')]
class CreateAdmin extends Command
{
    use PasswordValidationRules, ProfileValidationRules;

    public function handle(CreateAdministrator $create, MakeAdministrator $make): int
    {
        $email = Str::lower(trim((string) ($this->argument('email') ?? text('E-mail da administradora', required: true))));
        $existing = User::query()->where('email', $email)->first();

        try {
            if ($existing !== null) {
                if (! confirm("Já existe a conta @{$existing->username} com esse e-mail. Torná-la administradora?", default: false)) {
                    $this->warn('Nada foi alterado.');

                    return self::FAILURE;
                }

                $make->handle($existing);
                $this->finish($existing);

                return self::SUCCESS;
            }

            $data = [
                'name' => text('Nome', required: true),
                'username' => Str::lower(trim(text('Username', required: true))),
                'email' => $email,
                'password' => password('Senha', required: true),
                'locale' => config('app.locales')[0],
            ];

            $validator = Validator::make([
                ...$data,
                'password_confirmation' => password('Confirme a senha', required: true),
            ], [
                ...$this->profileRules(),
                'password' => $this->passwordRules(),
            ]);

            if ($validator->fails()) {
                foreach ($validator->errors()->all() as $error) {
                    $this->error($error);
                }

                return self::FAILURE;
            }

            $this->finish($create->handle($data));

            return self::SUCCESS;
        } catch (CannotMakeAdministrator $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }

    private function finish(User $user): void
    {
        $this->info("Pronto: @{$user->username} é a administradora.");
        if (config('auth.admin_two_factor')) {
            $this->line('No primeiro acesso a /admin, o painel pede a senha e a ativação do 2FA.');
        }
    }
}
