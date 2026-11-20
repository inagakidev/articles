import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

/** `**negrito**` ou `[texto](endereço)`, as únicas marcações dos textos das políticas. */
const TOKEN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

/** Só endereços internos, âncoras e e-mail: o texto nunca leva a outro site. */
function safeHref(href: string): string | null {
    return /^(\/(?!\/)|#|mailto:)/.test(href) ? href : null;
}

/**
 * Texto das políticas com negrito e links, sem HTML: os textos vêm do
 * repositório, mas são montados como elementos React, sem innerHTML (D73).
 */
export default function RichText({ text }: { text: string }) {
    const parts: ReactNode[] = [];
    let last = 0;

    for (const match of text.matchAll(TOKEN)) {
        parts.push(text.slice(last, match.index));
        const [, bold, label, href] = match;
        const key = match.index;

        if (bold !== undefined) {
            parts.push(<strong key={key}>{bold}</strong>);
        } else {
            const safe = safeHref(href);
            parts.push(
                safe === null ? (
                    label
                ) : safe.startsWith('/') ? (
                    <Link key={key} href={safe}>
                        {label}
                    </Link>
                ) : (
                    <a key={key} href={safe}>
                        {label}
                    </a>
                ),
            );
        }

        last = match.index + match[0].length;
    }

    parts.push(text.slice(last));

    return <>{parts}</>;
}
