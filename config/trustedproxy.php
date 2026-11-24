<?php

/*
 * Proxies confiáveis, lidos pelo TrustProxies do Laravel a cada requisição.
 * Atrás de um proxy (o túnel da prévia, ou o Cloudflare na frente do
 * servidor), a aplicação só sabe que a visita veio por https, e qual o
 * endereço real, se confiar nele. Sem a variável, ninguém é confiável.
 *
 *     TRUSTED_PROXIES=127.0.0.1,::1
 */
return [
    'proxies' => env('TRUSTED_PROXIES'),
];
