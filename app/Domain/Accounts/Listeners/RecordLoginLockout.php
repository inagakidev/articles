<?php

namespace App\Domain\Accounts\Listeners;

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\LoginRateLimiter;

/**
 * Registra como evento de segurança o login pausado depois de tentativas
 * seguidas (REQUIREMENTS.md RF-022 e RF-024).
 */
class RecordLoginLockout
{
    public function __construct(private LoginRateLimiter $limiter) {}

    public function handle(Lockout $event): void
    {
        $request = $event->request;
        $email = Str::lower(trim((string) $request->input(Fortify::username())));

        // O Lockout chega a cada tentativa durante a pausa (por e-mail no
        // Fortify, por IP no ThrottleAuthByIp). Um registro por e-mail e IP a
        // cada minuto basta e evita encher a tabela durante um ataque.
        $once = Cache::add(
            'security-events:login-blocked:'.sha1($email.'|'.$request->ip()),
            true,
            max(60, $this->limiter->availableIn($request)),
        );

        if (! $once) {
            return;
        }

        SecurityEvent::create([
            'user_id' => User::query()->where('email', $email)->value('id'),
            'type' => SecurityEventType::LoginBlocked,
            'email' => Str::limit($email, 255, ''),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 512, ''),
        ]);
    }
}
