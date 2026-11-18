import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Idioma } from '@/lib/i18n';
import { idiomas, nomesDosIdiomas, useTraducao } from '@/lib/i18n';
import { update } from '@/routes/locale';

function trocarIdioma(locale: Idioma) {
    router.put(update().url, { locale }, { preserveScroll: true });
}

/** Botão do cabeçalho: alterna entre os dois idiomas. */
export function LanguageToggle() {
    const { idioma, t } = useTraducao();
    const proximo = idiomas[(idiomas.indexOf(idioma) + 1) % idiomas.length];

    return (
        <Button
            type="button"
            variant="ghost"
            aria-label={t('language.toggle', {
                current: nomesDosIdiomas[idioma].nome,
                next: nomesDosIdiomas[proximo].nome,
            })}
            onClick={() => trocarIdioma(proximo)}
        >
            {nomesDosIdiomas[idioma].sigla}
        </Button>
    );
}

/** Lista do rodapé, com os idiomas pelo nome. */
export function LanguageSelect() {
    const { idioma, t } = useTraducao();

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="idioma" className="text-caption font-bold">
                {t('language.label')}
            </label>
            <select
                id="idioma"
                value={idioma}
                onChange={(event) => trocarIdioma(event.target.value as Idioma)}
                className="h-10 rounded-md border border-border-strong bg-surface px-3 text-meta text-text-primary"
            >
                {idiomas.map((opcao) => (
                    <option
                        key={opcao}
                        value={opcao}
                        lang={opcao.replace('_', '-')}
                    >
                        {nomesDosIdiomas[opcao].nome}
                    </option>
                ))}
            </select>
        </div>
    );
}
