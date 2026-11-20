import { usePage } from '@inertiajs/react';

import Logo from '@/components/ui/logo';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <Logo variant="icon" height={32} />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
