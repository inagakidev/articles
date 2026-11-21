<?php

namespace App\Domain\Accounts\Enums;

/**
 * Tipos de evento de segurança (REQUIREMENTS.md RF-024). Os demais tipos
 * (troca de e-mail e de senha, exclusão de conta) entram com as fatias deles.
 */
enum SecurityEventType: string
{
    /** O login foi pausado depois de tentativas seguidas com senha errada. */
    case LoginBlocked = 'login_blocked';

    /** A senha foi trocada, pelo link de recuperação ou logada. */
    case PasswordChanged = 'password_changed';

    /** O e-mail da conta foi trocado. */
    case EmailChanged = 'email_changed';

    /** O 2FA da administradora foi apagado pelo comando no servidor (RF-018). */
    case TwoFactorReset = 'two_factor_reset';

    /**
     * Tipos que contam como tentativa suspeita de login e somem depois de
     * 90 dias (REQUIREMENTS.md §2.23). Os outros ficam enquanto a conta existir.
     *
     * @return list<self>
     */
    public static function loginAttempts(): array
    {
        return [self::LoginBlocked];
    }
}
