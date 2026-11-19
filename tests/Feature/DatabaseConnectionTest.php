<?php

namespace Tests\Feature;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseConnectionTest extends TestCase
{
    public function test_database_clock_uses_the_application_timezone()
    {
        $databaseNow = Carbon::parse(DB::selectOne('select now() as agora')->agora, 'UTC');

        $this->assertLessThan(60, abs($databaseNow->diffInSeconds(now())));
    }

    public function test_text_comparison_ignores_case_and_accents_but_distinguishes_emoji()
    {
        $equal = fn (string $a, string $b): bool => (bool) DB::selectOne('select ? = ? as igual', [$a, $b])->igual;

        $this->assertTrue($equal('Laravel', 'laravel'));
        $this->assertTrue($equal('café', 'cafe'));
        $this->assertFalse($equal('🔥', '🎉'));
    }
}
