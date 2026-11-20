<?php

namespace App\Http\Controllers\Accounts;

use App\Domain\Accounts\Rules\Username;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Disponibilidade do username enquanto a pessoa digita (RF-029). A decisão
 * final é do cadastro, que valida de novo.
 */
class UsernameAvailabilityController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $username = Str::lower(trim((string) $request->query('username')));

        $validator = Validator::make(['username' => $username], ['username' => [new Username]]);

        if ($validator->fails()) {
            return response()->json([
                'username' => $username,
                'available' => false,
                'message' => $validator->errors()->first('username'),
            ]);
        }

        $taken = User::query()
            ->where('username', $username)
            ->when($request->user(), fn ($query, User $user) => $query->whereKeyNot($user->id))
            ->exists();

        return response()->json([
            'username' => $username,
            'available' => ! $taken,
            'message' => $taken ? __('account.username.taken') : null,
        ]);
    }
}
