<?php

namespace App\Domain\Accounts\Queries;

use App\Domain\Accounts\Enums\PolicyType;
use App\Models\PolicyVersion;
use App\Models\User;

/**
 * A versão em vigor de cada documento: a mais recente já publicada. Usada no
 * cadastro, nas páginas das políticas e no novo aceite (D72, D73).
 */
class CurrentPolicyVersions
{
    public function of(PolicyType $type): PolicyVersion
    {
        return PolicyVersion::query()
            ->where('type', $type)
            ->where('published_at', '<=', now())
            ->latest('published_at')
            ->latest('id')
            ->firstOrFail();
    }

    /**
     * As versões em vigor dos documentos que a pessoa aceita (RF-013).
     *
     * @return list<PolicyVersion>
     */
    public function accepted(): array
    {
        return array_map(fn (PolicyType $type) => $this->of($type), PolicyType::accepted());
    }

    /**
     * Versões em vigor que a pessoa ainda não aceitou: pede o novo aceite.
     *
     * @return list<PolicyVersion>
     */
    public function pendingFor(User $user): array
    {
        $accepted = $user->policyAcceptances()->pluck('policy_version_id')->all();

        return array_values(array_filter(
            $this->accepted(),
            fn (PolicyVersion $version) => ! in_array($version->id, $accepted, true),
        ));
    }

    /**
     * Todas as versões já publicadas do documento, da mais nova para a mais antiga.
     *
     * @return list<PolicyVersion>
     */
    public function history(PolicyType $type): array
    {
        return array_values(PolicyVersion::query()
            ->where('type', $type)
            ->where('published_at', '<=', now())
            ->latest('published_at')
            ->latest('id')
            ->get()
            ->all());
    }
}
