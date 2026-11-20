<?php

namespace App\Domain\Accounts\Queries;

use App\Domain\Accounts\Enums\PolicyType;
use App\Models\PolicyVersion;

/**
 * A versão em vigor de cada documento: a mais recente já publicada. Usada no
 * cadastro, nas páginas das políticas e, na fatia 4, no novo aceite.
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

    /** @return list<PolicyVersion> */
    public function all(): array
    {
        return array_map(fn (PolicyType $type) => $this->of($type), PolicyType::cases());
    }
}
