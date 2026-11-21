<?php

namespace App\Http\Controllers\Settings;

use App\Domain\Accounts\Actions\RequestEmailChange;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\EmailChangeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Pedir e cancelar a troca de e-mail (RF-030). */
class EmailChangeController extends Controller
{
    public function store(EmailChangeRequest $request, RequestEmailChange $requestChange): RedirectResponse
    {
        $requestChange->handle($request->user(), $request->validated('email'));

        return to_route('security.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->user()->forceFill([
            'pending_email' => null,
            'pending_email_expires_at' => null,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('settings.email.cancelled')]);

        return to_route('security.edit');
    }
}
