<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Username (RF-027 a RF-029) e idioma preferido da conta (D62).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 30)->nullable()->after('name');
            $table->string('locale', 5)->default('pt_BR')->after('email');
        });

        // Contas criadas antes desta migration ganham um username a partir do
        // e-mail, nas mesmas regras do cadastro.
        DB::table('users')->orderBy('id')->each(function (object $user) {
            $base = Str::of(Str::before($user->email, '@'))
                ->ascii()
                ->lower()
                ->replaceMatches('/[^a-z0-9_-]/', '')
                ->ltrim('0123456789_-')
                ->limit(24, '')
                ->toString();
            $base = strlen($base) >= 3 ? $base : 'conta'.$user->id;
            $username = $base;

            for ($i = 2; DB::table('users')->where('username', $username)->exists(); $i++) {
                $username = $base.'-'.$i;
            }

            DB::table('users')->where('id', $user->id)->update(['username' => $username]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 30)->nullable(false)->change();
            $table->unique('username');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'locale']);
        });
    }
};
