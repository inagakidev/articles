import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Início" />
            <div className="flex min-h-screen flex-col bg-bg text-text-primary">
                <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
                    <span className="font-display text-lg font-bold">
                        Plataforma de Artigos
                    </span>
                    <nav className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md px-4 py-2 font-semibold text-primary-text hover:bg-surface-hover"
                            >
                                Meus artigos
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md px-4 py-2 font-semibold text-primary-text hover:bg-surface-hover"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md bg-primary px-4 py-2 font-semibold text-text-on-primary hover:bg-primary-hover active:bg-primary-active"
                                >
                                    Criar conta
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
                    <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Artigos técnicos da comunidade He4rt
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-text-secondary">
                        Escreva, envie para revisão, publique.
                    </p>
                </main>
            </div>
        </>
    );
}
