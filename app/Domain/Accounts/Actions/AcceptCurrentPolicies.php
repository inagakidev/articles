<?php

namespace App\Domain\Accounts\Actions;

use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use App\Models\PolicyAcceptance;
use App\Models\User;

/** Registra o aceite das versões em vigor dos Termos e da Privacidade (RF-013). */
class AcceptCurrentPolicies
{
    public function __construct(private CurrentPolicyVersions $versions) {}

    public function handle(User $user): void
    {
        foreach ($this->versions->accepted() as $version) {
            PolicyAcceptance::firstOrCreate(
                ['user_id' => $user->id, 'policy_version_id' => $version->id],
                ['accepted_at' => now()],
            );
        }
    }
}
