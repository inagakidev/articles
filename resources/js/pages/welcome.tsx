import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Início" />
            <section className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center px-4 py-16 sm:px-8">
                <h1 className="max-w-2xl text-h1 font-extrabold sm:text-display">
                    Artigos técnicos da comunidade He4rt
                </h1>
                <p className="mt-4 max-w-xl text-article text-text-secondary">
                    Escreva, envie para revisão, publique.
                </p>
            </section>
        </>
    );
}
