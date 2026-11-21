<?php

namespace App\Support\Editor\Tiptap;

use Tiptap\Nodes\Heading;

/** Título com âncora, para o sumário "Neste artigo" levar até ele (RF-095). */
class AnchoredHeading extends Heading
{
    /** @return array<string, mixed> */
    public function addAttributes()
    {
        return [
            'id' => [
                'renderHTML' => fn ($attributes) => isset($attributes->id) ? ['id' => $attributes->id] : null,
            ],
        ];
    }
}
