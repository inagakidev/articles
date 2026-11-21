<?php

namespace App\Console\Commands;

use App\Domain\Accounts\Actions\ResetAdministratorTwoFactor;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;

/**
 * Último recurso quando a administradora perdeu o aparelho e os códigos de
 * recuperação (RF-018). Só roda no servidor; o painel não tem essa opção.
 */
#[Signature('admin:reset-2fa')]
#[Description('Apaga o 2FA da administradora e encerra as sessões dela (último recurso)')]
class ResetAdminTwoFactor extends Command
{
    public function handle(ResetAdministratorTwoFactor $reset): int
    {
        $admin = User::query()->where('is_admin', true)->first();

        if ($admin === null) {
            $this->error('Ainda não existe administradora. Crie com php artisan admin:create.');

            return self::FAILURE;
        }

        if (! $admin->hasConfirmedTwoFactor() && $admin->two_factor_secret === null) {
            $this->warn("@{$admin->username} não tem 2FA ativo. Nada a fazer.");

            return self::SUCCESS;
        }

        if (! confirm("Apagar o 2FA de @{$admin->username} ({$admin->email}) e encerrar as sessões dela?", default: false)) {
            $this->warn('Nada foi alterado.');

            return self::FAILURE;
        }

        $reset->handle($admin);

        $this->info('2FA apagado e sessões encerradas. No próximo acesso ao painel, ela ativa o 2FA de novo com novos códigos de recuperação.');

        return self::SUCCESS;
    }
}
