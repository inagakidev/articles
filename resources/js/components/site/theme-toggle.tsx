import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import type { ChaveDeTraducao } from '@/lib/i18n';
import { useTraducao } from '@/lib/i18n';

export const temas: { valor: Appearance; chave: ChaveDeTraducao }[] = [
    { valor: 'system', chave: 'theme.system' },
    { valor: 'light', chave: 'theme.light' },
    { valor: 'dark', chave: 'theme.dark' },
];

const icones = { system: Monitor, light: Sun, dark: Moon };

/** Botão do cabeçalho: alterna entre dispositivo, claro e escuro. */
export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTraducao();
    const atual = temas.findIndex((tema) => tema.valor === appearance);
    const proximo = temas[(atual + 1) % temas.length];
    const Icone = icones[appearance];

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('theme.toggle', {
                current: t(temas[atual].chave).toLowerCase(),
                next: t(proximo.chave).toLowerCase(),
            })}
            onClick={() => updateAppearance(proximo.valor)}
        >
            <Icone aria-hidden="true" className="size-5" />
        </Button>
    );
}

/** Lista do rodapé, com as três opções visíveis. */
export function ThemeSelect() {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTraducao();

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="tema" className="text-caption font-bold">
                {t('theme.label')}
            </label>
            <select
                id="tema"
                value={appearance}
                onChange={(event) =>
                    updateAppearance(event.target.value as Appearance)
                }
                className="h-10 rounded-md border border-border-strong bg-surface px-3 text-meta text-text-primary"
            >
                {temas.map((tema) => (
                    <option key={tema.valor} value={tema.valor}>
                        {t(tema.chave)}
                    </option>
                ))}
            </select>
        </div>
    );
}
