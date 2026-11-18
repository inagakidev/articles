<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Define o idioma da requisição: o escolhido pela pessoa (cookie) ou, na
 * falta dele, o do navegador. Sem correspondência, vale o padrão.
 */
class SetLocale
{
    public const COOKIE = 'locale';

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale($this->localeFor($request));

        return $next($request);
    }

    private function localeFor(Request $request): string
    {
        /** @var list<string> $locales */
        $locales = config('app.locales');
        $chosen = $request->cookie(self::COOKIE);

        if (is_string($chosen) && in_array($chosen, $locales, true)) {
            return $chosen;
        }

        return $request->getPreferredLanguage($locales) ?? $locales[0];
    }
}
