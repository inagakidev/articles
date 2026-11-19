import { usePage } from '@inertiajs/react';

import Mascote from '@/components/mascote';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <Mascote arte="mascote-avatar" tamanho={32} />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
