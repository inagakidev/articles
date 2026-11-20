import type { ComponentProps, Ref } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Campo de senha com o botão "Mostrar" das pranchas. */
export default function PasswordInput({
    className,
    ref,
    ...props
}: Omit<ComponentProps<'input'>, 'type'> & { ref?: Ref<HTMLInputElement> }) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const text = visible ? t('account.password.hide') : t('account.password.show');
    const label = visible
        ? t('account.password.hide.label')
        : t('account.password.show.label');

    return (
        <div className="relative">
            <Input
                type={visible ? 'text' : 'password'}
                className={cn('pr-24', className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                aria-label={label}
                aria-controls={props.id}
                className="absolute top-1 right-1 h-10 rounded-[10px] px-3 text-meta font-bold text-primary-text hover:bg-surface-hover"
            >
                {text}
            </button>
        </div>
    );
}
