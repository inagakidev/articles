<?php

use App\Http\Controllers\NotFoundController;
use App\Http\Middleware\EnsurePoliciesAccepted;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\ThrottleAuthByIp;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // No documento do editor, o espaço no começo ou no fim de um trecho
        // ("eu achava que " + **negrito**) é parte do texto (D80).
        $middleware->trimStrings(except: [
            // Roda antes do roteamento, então confere o caminho, não o nome da rota.
            fn (Request $request) => $request->is('articles', 'articles/*/draft'),
        ]);

        // Quem já entrou e abre o login ou o cadastro volta para o início, onde
        // o menu da conta tem "Sair", em vez de cair numa tela da conta.
        $middleware->redirectUsersTo(fn () => route('home'));

        $middleware->web(append: [
            HandleAppearance::class,
            SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // Depois do SetLocale, para a mensagem sair no idioma da pessoa.
            ThrottleAuthByIp::class,
            // Versão nova dos Termos ou da Privacidade: aceite antes de continuar (D73).
            EnsurePoliciesAccepted::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // 404 dentro de uma rota (artigo fora do ar, modelo que não existe) vira
        // a página do site; JSON e imagens continuam com a resposta curta. O
        // endereço que não casa com rota nenhuma cai no fallback de web.php.
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($response->getStatusCode() !== 404 || $request->expectsJson() || $request->is('media/*')) {
                return $response;
            }

            return app(NotFoundController::class)($request);
        });
    })->create();
