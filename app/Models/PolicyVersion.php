<?php

namespace App\Models;

use App\Domain\Accounts\Enums\PolicyType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Uma versão publicada dos Termos ou da Privacidade. O texto fica em
 * resources/policies/<tipo>/<versão>.<idioma>.md (D72).
 *
 * @property int $id
 * @property PolicyType $type
 * @property string $version
 * @property Carbon $published_at
 */
class PolicyVersion extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'type' => PolicyType::class,
            'published_at' => 'datetime',
        ];
    }

    /** Versão provisória, enquanto os textos finais não são publicados. */
    public function isDraft(): bool
    {
        return str_ends_with($this->version, '-draft');
    }
}
