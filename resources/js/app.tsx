import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import EditorLayout from '@/layouts/editor-layout';
import LandingLayout from '@/layouts/landing-layout';
import PublicLayout from '@/layouts/public-layout';
import ReadingLayout from '@/layouts/reading-layout';
import SettingsLayout from '@/layouts/settings-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'home':
                return LandingLayout;
            case name === 'articles/show':
                return ReadingLayout;
            case name === 'articles/index' ||
                name.startsWith('errors/') ||
                name.startsWith('search/') ||
                name.startsWith('policies/') ||
                name.startsWith('profile/') ||
                name.startsWith('my-articles/'):
                return PublicLayout;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('articles/'):
                return EditorLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [PublicLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// O <html lang> vem do servidor no primeiro carregamento; nas trocas de idioma, é atualizado aqui.
router.on('success', (event) => {
    document.documentElement.lang = event.detail.page.props.locale.replace(
        '_',
        '-',
    );
});
