import type { ReactNode } from 'react';

/**
 * Editor e prévia: tela cheia, com o próprio cabeçalho de cada página
 * (pranchas "Editor" e "Prévia"), sem o cabeçalho do site.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
    return <div className="min-h-svh bg-bg text-text-primary">{children}</div>;
}
