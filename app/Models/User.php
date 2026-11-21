<?php

namespace App\Models;

use App\Notifications\ResetPassword;
use App\Notifications\VerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $username
 * @property string $email
 * @property string $locale
 * @property bool $is_admin
 * @property string|null $bio
 * @property string|null $avatar_path
 * @property-read string|null $avatar
 * @property string|null $pending_email
 * @property Carbon|null $pending_email_expires_at
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'bio', 'email', 'password', 'locale'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'avatar_path', 'pending_email', 'pending_email_expires_at'])]
class User extends Authenticatable implements HasLocalePreference, MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, MassPrunable, Notifiable, TwoFactorAuthenticatable;

    /** @var array<string, mixed> */
    protected $attributes = [
        'is_admin' => false,
    ];

    /** @var list<string> */
    protected $appends = ['avatar'];

    /** Horas para confirmar um e-mail novo; depois disso, a troca cai (RF-030). */
    public const EMAIL_CHANGE_HOURS = 24;

    /** Prazo para confirmar o e-mail; no dia seguinte a conta é excluída (RF-023). */
    public const VERIFICATION_DAYS = 7;

    /** Idioma dos e-mails enviados sem uma requisição por perto (D62). */
    public function preferredLocale(): string
    {
        return $this->locale;
    }

    /**
     * O painel só abre com o 2FA confirmado (RF-017). Com a confirmação
     * ligada no Fortify, ter o segredo não basta: é preciso ter confirmado.
     */
    public function hasConfirmedTwoFactor(): bool
    {
        return $this->two_factor_secret !== null && $this->two_factor_confirmed_at !== null;
    }

    /**
     * Endereço da foto de perfil, servido pela rota de mídia (D53); null sem foto.
     *
     * @return Attribute<string|null, never>
     */
    protected function avatar(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->avatar_path === null
            ? null
            : route('media.show', ['path' => $this->avatar_path], absolute: false));
    }

    /** Troca de e-mail esperando o link, ainda dentro do prazo (RF-030). */
    public function hasPendingEmail(): bool
    {
        return $this->pending_email !== null
            && $this->pending_email_expires_at?->isFuture() === true;
    }

    /** @return HasMany<PolicyAcceptance, $this> */
    public function policyAcceptances(): HasMany
    {
        return $this->hasMany(PolicyAcceptance::class);
    }

    /**
     * Contas que não confirmaram o e-mail no prazo, apagadas pelo `model:prune`
     * diário. Username e e-mail ficam livres na hora (RF-023, RF-029).
     *
     * @return Builder<static>
     */
    public function prunable(): Builder
    {
        return static::query()
            ->whereNull('email_verified_at')
            ->where('created_at', '<', now()->subDays(self::VERIFICATION_DAYS));
    }

    /**
     * Os e-mails de conta vão pela fila, no idioma em que a pessoa está
     * usando o site quando os pede.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify((new VerifyEmail)->locale(app()->getLocale()));
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify((new ResetPassword($token))->locale(app()->getLocale()));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
            'pending_email_expires_at' => 'datetime',
        ];
    }
}
