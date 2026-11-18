<?php

namespace Tests\Feature;

use App\Http\Middleware\SetLocale;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    public function test_portuguese_is_the_default()
    {
        // O cliente de testes envia "en-us" por padrão; aqui, navegador sem idioma
        $this->withHeader('Accept-Language', '')
            ->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
    }

    public function test_browser_language_is_used_when_nothing_was_chosen()
    {
        $this->withHeader('Accept-Language', 'en-US,en;q=0.9')
            ->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    public function test_unsupported_browser_language_falls_back_to_portuguese()
    {
        $this->withHeader('Accept-Language', 'de-DE,de;q=0.9')
            ->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
    }

    public function test_chosen_language_wins_over_the_browser()
    {
        $this->withHeader('Accept-Language', 'en-US')
            ->withCookie(SetLocale::COOKIE, 'pt_BR')
            ->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
    }

    public function test_unknown_cookie_value_is_ignored()
    {
        $this->withHeader('Accept-Language', '')
            ->withCookie(SetLocale::COOKIE, 'xx')
            ->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
    }

    public function test_language_can_be_changed()
    {
        $this->from(route('home'))
            ->put(route('locale.update'), ['locale' => 'en'])
            ->assertRedirect(route('home'))
            ->assertCookie(SetLocale::COOKIE, 'en');
    }

    public function test_only_supported_languages_can_be_chosen()
    {
        $this->from(route('home'))
            ->put(route('locale.update'), ['locale' => 'fr'])
            ->assertSessionHasErrors('locale')
            ->assertCookieMissing(SetLocale::COOKIE);
    }

    public function test_html_lang_follows_the_language()
    {
        $this->withCookie(SetLocale::COOKIE, 'en')
            ->get(route('home'))
            ->assertSee('<html lang="en"', false);

        $this->withCookie(SetLocale::COOKIE, 'pt_BR')
            ->get(route('home'))
            ->assertSee('<html lang="pt-BR"', false);
    }
}
