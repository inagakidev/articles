<?php

namespace App\Domain\Accounts\Enums;

/** As três páginas públicas de políticas (RF-272). */
enum PolicyType: string
{
    case Terms = 'terms';
    case Privacy = 'privacy';
    /** O que não pode ser publicado. Não tem aceite: vale pelos Termos. */
    case Content = 'content';

    /**
     * Documentos aceitos no cadastro e de novo a cada versão (RF-013).
     *
     * @return list<self>
     */
    public static function accepted(): array
    {
        return [self::Terms, self::Privacy];
    }

    /** Nome da rota da página pública do documento. */
    public function routeName(): string
    {
        return 'policies.'.$this->value;
    }
}
