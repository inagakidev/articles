import { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';

/** Nomes das linguagens na barra dos blocos de código. */
const LANGUAGE_NAMES: Record<string, string> = {
    bash: 'Bash',
    cpp: 'C++',
    csharp: 'C#',
    css: 'CSS',
    dotenv: '.env',
    graphql: 'GraphQL',
    html: 'HTML',
    http: 'HTTP',
    javascript: 'JavaScript',
    json: 'JSON',
    jsx: 'JSX',
    php: 'PHP',
    scss: 'SCSS',
    sql: 'SQL',
    tsx: 'TSX',
    typescript: 'TypeScript',
    xml: 'XML',
    yaml: 'YAML',
};

/**
 * O corpo do artigo como o servidor o gerou (`ArticleRenderer`, D51): o HTML
 * já vem limpo e com o código colorido. Aqui só entram a barra dos blocos de
 * código, com a linguagem e o botão "Copiar". Serve à prévia e à leitura.
 */
export default function ArticleBody({
    html,
    lang,
}: {
    html: string;
    lang?: string | null;
}) {
    const { t } = useTranslation();
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const blocks =
            root.current?.querySelectorAll<HTMLPreElement>('pre.code-block') ??
            [];

        blocks.forEach((pre) => {
            if (
                pre.previousElementSibling?.classList.contains('code-block-bar')
            ) {
                return;
            }

            const bar = document.createElement('div');
            bar.className = 'code-block-bar';
            const language = pre.dataset.language;
            const label = document.createElement('span');
            label.textContent = language
                ? (LANGUAGE_NAMES[language] ?? language)
                : '';
            const copy = document.createElement('button');
            copy.type = 'button';
            copy.textContent = t('article.copy_code');
            copy.addEventListener('click', () => {
                void navigator.clipboard?.writeText(pre.innerText).then(() => {
                    copy.textContent = t('article.code_copied');
                    setTimeout(
                        () => (copy.textContent = t('article.copy_code')),
                        2000,
                    );
                });
            });
            bar.append(label, copy);
            pre.before(bar);
            pre.tabIndex = 0;
        });
    }, [html, t]);

    return (
        <div
            ref={root}
            lang={lang?.replace('_', '-') ?? undefined}
            className="article-body"
            // HTML gerado e limpo no servidor (DocumentSanitizer + ArticleRenderer).
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
