<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cabeçalhos de segurança em todas as respostas (D93): o site não pode ser
 * embutido em outro (clickjacking), o navegador não adivinha tipos de
 * arquivo, o endereço completo não vaza para outros sites e câmera,
 * microfone e localização ficam desligados. Em HTTPS de produção, o
 * navegador passa a exigir HTTPS (HSTS).
 *
 * A CSP vai em modo só de relatório: os bloqueios aparecem no console sem
 * quebrar nada, até ser conferida em todas as telas e virar obrigatória.
 */
class AddSecurityHeaders
{
    /** Um ano, como pedem as listas de pré-carregamento de HSTS. */
    private const HSTS_SECONDS = 31536000;

    public function handle(Request $request, Closure $next): Response
    {
        // O nonce libera só os scripts da própria página (tema e Vite)
        $nonce = Vite::useCspNonce();

        $response = $next($request);
        $headers = $response->headers;

        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('X-Frame-Options', 'DENY');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        if ($request->isSecure() && app()->isProduction()) {
            $headers->set('Strict-Transport-Security', 'max-age='.self::HSTS_SECONDS.'; includeSubDomains');
        }

        // Em desenvolvimento, o servidor do Vite serve os scripts de outra porta
        if (! app()->isLocal()) {
            $headers->set('Content-Security-Policy-Report-Only', implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'nonce-{$nonce}'",
                // Estilos inline do React (style={{…}}) e do Tailwind
                "style-src 'self' 'unsafe-inline'",
                // Imagens do armazenamento (R2) vêm de outro domínio, por HTTPS
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
            ]));
        }

        return $response;
    }
}
