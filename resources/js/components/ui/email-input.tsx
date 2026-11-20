import type { ComponentProps, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

/**
 * Domínio completo, com ponto: o `type="email"` do navegador aceita
 * "lia@gmail", e o servidor não (email:rfc,filter).
 */
export const EMAIL_PATTERN = '[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}';

/** Campo de e-mail que avisa no navegador, antes do envio, quando falta o domínio. */
export default function EmailInput(props: Omit<ComponentProps<'input'>, 'type'>) {
    const { t } = useTranslation();

    const explain = (event: FormEvent<HTMLInputElement>) => {
        const input = event.currentTarget;

        input.setCustomValidity(
            input.validity.typeMismatch || input.validity.patternMismatch
                ? t('account.email.invalid')
                : '',
        );
    };

    return (
        <Input
            {...props}
            type="email"
            pattern={EMAIL_PATTERN}
            autoCapitalize="none"
            spellCheck={false}
            onInvalid={explain}
            onInput={(event) => {
                // Limpa o aviso enquanto a pessoa corrige; confere de novo no envio.
                event.currentTarget.setCustomValidity('');
                props.onInput?.(event);
            }}
        />
    );
}
