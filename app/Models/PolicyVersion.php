<?php

namespace App\Models;

use App\Domain\Accounts\Enums\PolicyType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Uma versão publicada de uma política. O texto fica em
 * resources/policies/<tipo>/<versão>.<idioma>.json (D73).
 *
 * @property int $id
 * @property PolicyType $type
 * @property string $version
 * @property bool $draft
 * @property Carbon $published_at
 */
class PolicyVersion extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'type' => PolicyType::class,
            'draft' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /** Versão provisória, enquanto os textos não passam pela validação jurídica. */
    public function isDraft(): bool
    {
        return $this->draft;
    }
}
