import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import NotificationBell from '@/components/notifications/notification-bell';

describe('sino', () => {
    afterEach(() => {
        Object.assign(testPage.props, { notifications: undefined });
    });

    it('não aparece para visitante', () => {
        Object.assign(testPage.props, { notifications: null });
        const { container } = render(<NotificationBell />);

        expect(container).toBeEmptyDOMElement();
    });

    it('diz quantas não lidas há, no nome e no selo', () => {
        Object.assign(testPage.props, {
            notifications: { unread: 12, latest: [] },
        });
        render(<NotificationBell />);

        expect(
            screen.getByRole('button', { name: 'Notificações: 12 não lidas' }),
        ).toHaveTextContent('9+');
    });
});
