<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Notificações dentro do site (RF-179 a RF-192, D90), no formato das
        // notificações do Laravel
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->json('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Retenção de 90 dias (RF-191)
            $table->index('updated_at');
        });

        // Endereço que voltou ou reclamou deixa de receber e-mails (p6-17, D71)
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_suppressed_at')->nullable()->after('email_verified_at');
            $table->string('email_suppressed_reason', 20)->nullable()->after('email_suppressed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_suppressed_at', 'email_suppressed_reason']);
        });
        Schema::dropIfExists('notifications');
    }
};
