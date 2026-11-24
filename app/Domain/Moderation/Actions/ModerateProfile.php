<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Accounts\Actions\RemoveAvatar;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Rules\AuditLabel;
use App\Models\User;
use App\Notifications\Reports\ProfileModerated;
use Illuminate\Support\Facades\DB;

/**
 * Perfil inadequado (RF-178, RF-253): a foto volta às iniciais, a bio fica
 * vazia e, com username inadequado, a pessoa troca no próximo acesso. Com
 * o item da Política e a justificativa na auditoria, e o aviso no site
 * (RF-187).
 */
class ModerateProfile
{
    public function __construct(
        private readonly RecordAudit $audit,
        private readonly RemoveAvatar $removeAvatar,
    ) {}

    public function handle(User $profile, User $admin, bool $photo, bool $bio, bool $username, string $policyItem, string $reason): void
    {
        DB::transaction(function () use ($profile, $admin, $photo, $bio, $username, $policyItem, $reason) {
            $this->audit->handle($admin, AuditAction::ProfileModerated, AuditLabel::profile($profile), $profile, $policyItem, $reason, ['reset' => array_keys(array_filter([
                'photo' => $photo,
                'bio' => $bio,
                'username' => $username,
            ]))]);

            if ($bio) {
                $profile->forceFill(['bio' => null]);
            }

            if ($username) {
                $profile->forceFill(['username_change_required_at' => now(), 'username_change_policy_item' => $policyItem]);
            }

            $profile->save();

            if ($photo) {
                $this->removeAvatar->handle($profile);
            }

            $profile->notify(new ProfileModerated($photo, $bio, $username, $policyItem));
        });
    }
}
