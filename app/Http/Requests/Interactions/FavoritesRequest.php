<?php

namespace App\Http\Requests\Interactions;

use Illuminate\Foundation\Http\FormRequest;

/**
 * A ordem da lista de favoritos pelo endereço (`ordem=salvos|publicados`).
 * Valor desconhecido volta para o padrão, sem erro, como na busca (D85).
 */
class FavoritesRequest extends FormRequest
{
    /** Parâmetro do endereço para cada ordem de `UserFavorites`. */
    public const SORTS = ['salvos' => 'saved', 'publicados' => 'published'];

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [];
    }

    /** @return 'saved'|'published' */
    public function sort(): string
    {
        return self::SORTS[$this->sortParam()];
    }

    public function sortParam(): string
    {
        $param = $this->string('ordem')->toString();

        return array_key_exists($param, self::SORTS) ? $param : 'salvos';
    }
}
