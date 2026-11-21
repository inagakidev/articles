import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useRef } from 'react';
import type { FieldProps } from '@/components/ui/form-field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

/** Dígitos do código do app autenticador. */
export const CODE_LENGTH = 6;

/**
 * Código de 6 dígitos do app autenticador, uma caixa por dígito. Aceita
 * colar o código inteiro e envia o formulário sozinho quando completa.
 * Use dentro de `FormField`, que liga o rótulo, a dica e o erro.
 */
export default function CodeInput({
    name,
    value,
    onChange,
    disabled,
    field,
}: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    field: FieldProps;
}) {
    const input = useRef<HTMLInputElement>(null);

    return (
        <InputOTP
            ref={input}
            {...field}
            name={name}
            maxLength={CODE_LENGTH}
            value={value}
            onChange={onChange}
            onComplete={() => input.current?.form?.requestSubmit()}
            disabled={disabled}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            containerClassName="justify-center"
        >
            <InputOTPGroup className="gap-2 sm:gap-2.5">
                {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot
                        key={index}
                        index={index}
                        className="h-14 w-11 rounded-inner border border-border-strong bg-surface font-display text-h3 font-extrabold shadow-none first:rounded-inner first:border-l last:rounded-inner sm:w-12 aria-invalid:border-danger-fg"
                    />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}
