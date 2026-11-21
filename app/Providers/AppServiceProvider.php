<?php

namespace App\Providers;

use App\Domain\Accounts\Listeners\RecordLoginLockout;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\DevCommands;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureDevProcesses();
        $this->configureEvents();
        $this->configureAuthorization();
    }

    /**
     * Regras de autorização sem modelo. Não há liberação geral para a
     * administradora (`Gate::before`), porque ela também tem restrições
     * (D56); as regras de cada modelo ficam nas Policies.
     */
    protected function configureAuthorization(): void
    {
        Gate::define('access-admin', fn (User $user): bool => $user->is_admin);
    }

    /**
     * Reações a eventos do framework. Os listeners do domínio ficam em
     * app/Domain/<Módulo>/Listeners e são registrados aqui.
     */
    protected function configureEvents(): void
    {
        Event::listen(Lockout::class, RecordLoginLockout::class);
    }

    /**
     * O `composer dev` sobe servidor, fila, logs e Vite; o agendador entra
     * junto para que as rotinas de routes/console.php rodem localmente.
     */
    protected function configureDevProcesses(): void
    {
        DevCommands::artisan('schedule:work', 'scheduler');
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // Mínimo de 8 e nenhuma senha que já apareceu em vazamentos (D72). A
        // consulta envia só o começo do hash; fora do ar, a senha é aceita.
        // Nos testes ela fica desligada para não depender da rede.
        Password::defaults(fn (): Password => app()->runningUnitTests()
            ? Password::min(8)
            : Password::min(8)->uncompromised(),
        );
    }
}
