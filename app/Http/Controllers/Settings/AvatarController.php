<?php

namespace App\Http\Controllers\Settings;

use App\Domain\Accounts\Actions\RemoveAvatar;
use App\Domain\Accounts\Actions\UpdateAvatar;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Trocar ou tirar a foto de perfil (RF-026, RF-033). */
class AvatarController extends Controller
{
    public function store(AvatarUpdateRequest $request, UpdateAvatar $update): RedirectResponse
    {
        $update->handle($request->user(), $request->file('avatar'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('settings.avatar.saved')]);

        return to_route('profile.edit');
    }

    public function destroy(Request $request, RemoveAvatar $remove): RedirectResponse
    {
        $remove->handle($request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('settings.avatar.removed')]);

        return to_route('profile.edit');
    }
}
