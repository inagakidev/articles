<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountNotPenalized
{
    private const ALLOWED = [
        'penalty.suspended',
        'penalty.appeal',
        'logout',
        'locale.update',
        'policies.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || $request->routeIs(...self::ALLOWED)) {
            return $next($request);
        }

        if ($user->isBanned()) {
            return redirect()->route('penalty.suspended');
        }

        if ($user->isSuspended()) {
            return redirect()->route('penalty.suspended');
        }

        return $next($request);
    }
}
