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

}
