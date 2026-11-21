<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Perfil público (RF-025: bio e foto) e a troca de e-mail que espera
 * confirmação (RF-030): o e-mail novo só vale depois do link, em até 24 h.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('bio', 300)->nullable()->after('username');
            $table->string('avatar_path')->nullable()->after('bio');
            $table->string('pending_email')->nullable()->after('email');
            $table->timestamp('pending_email_expires_at')->nullable()->after('pending_email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'avatar_path', 'pending_email', 'pending_email_expires_at']);
        });
    }
};
