import { usePage } from '@inertiajs/react';

import Mascot from '@/components/mascot';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <Mascot art="mascote-avatar" size={32} />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
