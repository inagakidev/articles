<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Cria a conta da administradora na instalação (RF-244): e-mail já
 * confirmado, aceite das políticas em vigor e a permissão de administradora.
 */
class CreateAdministrator
{
    public function __construct(
        private AcceptCurrentPolicies $acceptPolicies,
        private MakeAdministrator $makeAdministrator,
    ) {}

    /**
     * @param  array{name: string, username: string, email: string, password: string, locale: string}  $data  já validados
     */
    public function handle(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create($data);
            $user->forceFill(['email_verified_at' => now()])->save();

            $this->acceptPolicies->handle($user);
            $this->makeAdministrator->handle($user);

            return $user;
        });
    }
}
