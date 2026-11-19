<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    /**
     * Guarda o idioma escolhido num cookie essencial por um ano (RF-275).
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(config('app.locales'))],
        ]);

        return back()->withCookie(cookie(SetLocale::COOKIE, $validated['locale'], 60 * 24 * 365));
    }
}
