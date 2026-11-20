<?php

namespace App\Domain\Accounts\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * Formato e palavras reservadas do username (RF-027 e RF-028). A
 * disponibilidade (RF-029) é a regra `unique` de quem valida.
 */
class Username implements ValidationRule
{
    /** De 3 a 30 caracteres, minúsculas sem acento, números, - e _, começando por letra. */
    public const PATTERN = '/^[a-z][a-z0-9_-]{2,29}$/';

    /** Nomes que confundiriam com a plataforma ou com a equipe. */
    private const RESERVED = [
        'admin', 'administrador', 'administradora', 'adm', 'moderador', 'moderadora',
        'moderacao', 'moderation', 'suporte', 'support', 'ajuda', 'help', 'equipe',
        'team', 'staff', 'oficial', 'official', 'sistema', 'system', 'root', 'api',
        'login', 'logout', 'entrar', 'sair', 'cadastro', 'signup', 'register',
        'conta', 'account', 'perfil', 'profile', 'configuracoes', 'settings',
        'artigos', 'articles', 'busca', 'search', 'he4rt', 'he4rtink', 'heart',
        'anonimo', 'anonymous', 'null', 'undefined',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $value = (string) $value;

        if (! preg_match(self::PATTERN, $value)) {
            $fail('account.username.invalid')->translate();

            return;
        }

        if (self::isReserved($value)) {
            $fail('account.username.reserved')->translate();
        }
    }

    /** Reservado pela lista ou por ser o começo de uma rota da aplicação. */
    public static function isReserved(string $username): bool
    {
        return in_array($username, self::RESERVED, true)
            || in_array($username, self::routeSegments(), true);
    }

    /** @return list<string> */
    private static function routeSegments(): array
    {
        $segments = [];

        foreach (Route::getRoutes() as $route) {
            $first = Str::lower(Str::before($route->uri(), '/'));

            if ($first !== '' && ! str_starts_with($first, '{')) {
                $segments[] = $first;
            }
        }

        return array_values(array_unique($segments));
    }
}
