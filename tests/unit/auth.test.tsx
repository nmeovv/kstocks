import {afterEach, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';

import {AuthControl, LoginRequiredPrompt} from '@/auth/auth-control';
import {AuthProvider} from '@/auth/auth-context';
import {useApiTransport} from '@/api/use-api-transport';
import {AppI18nProvider} from '@/i18n';
import {PopupProvider} from '@/components/ui/popup';

afterEach(() => {
    vi.unstubAllGlobals();
});

it('logs a guest in with the token copied from Telegram', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({authenticated: false}))
        .mockResolvedValueOnce(new Response(null, {status: 204}))
        .mockResolvedValueOnce(
            jsonResponse({
                authenticated: true,
                user: {id: 3, username: 'listener', firstName: null, lastName: null, avatarUrl: null},
            }),
        );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAuth(<AuthControl />);

    const login = await screen.findByRole('button', {name: 'Log in'});
    await user.click(login);
    await user.type(screen.getByLabelText('Login token'), 'abcdefghijklmnopqrstuvwxyz0123456789_TOKEN');
    await user.click(screen.getByRole('button', {name: 'Log in'}));

    expect(await screen.findByText('listener')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/v1/auth/login',
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({token: 'abcdefghijklmnopqrstuvwxyz0123456789_TOKEN'}),
        }),
    );
});

it('explains that an invalid token can be re-requested', async () => {
    vi.stubGlobal(
        'fetch',
        vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({authenticated: false}))
            .mockResolvedValueOnce(new Response(null, {status: 401})),
    );
    const user = userEvent.setup();

    renderAuth(<AuthControl />);
    await user.click(await screen.findByRole('button', {name: 'Log in'}));
    await user.type(screen.getByLabelText('Login token'), 'abcdefghijklmnopqrstuvwxyz0123456789_TOKEN');
    await user.click(screen.getByRole('button', {name: 'Log in'}));

    expect(await screen.findByRole('alert')).toHaveTextContent('Send /login again for a new one.');
});

it('renders authenticated identity and becomes a guest after logout', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
            jsonResponse({
                authenticated: true,
                user: {
                    id: 3,
                    username: 'listener',
                    firstName: null,
                    lastName: null,
                    avatarUrl: null,
                },
            }),
        )
        .mockResolvedValueOnce(new Response(null, {status: 204}));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAuth(<AuthControl />);

    expect(await screen.findByText('listener')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Log out'}));
    await waitFor(() => expect(screen.getByRole('button', {name: 'Log in'})).toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith(
        '/logout',
        expect.objectContaining({method: 'POST', credentials: 'same-origin'}),
    );
});

it('keeps a backend bootstrap failure distinct from a guest session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    renderAuth(<AuthControl />);

    expect(await screen.findByRole('button', {name: 'Retry'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Log in'})).not.toBeInTheDocument();
});

it('shows an explicit login prompt after a protected mutation returns 401', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({authenticated: false}))
        .mockResolvedValueOnce(new Response(null, {status: 401}));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    renderAuth(
        <>
            <ProtectedAction />
            <LoginRequiredPrompt />
        </>,
    );

    await user.click(await screen.findByRole('button', {name: 'Save rating'}));
    expect(await screen.findByText('Log in with Telegram to make changes.')).toBeInTheDocument();
});

const renderAuth = (children: React.ReactNode) => {
    return render(
        <AppI18nProvider>
            <MemoryRouter>
                <AuthProvider>
                    <PopupProvider platform="desktop">{children}</PopupProvider>
                </AuthProvider>
            </MemoryRouter>
        </AppI18nProvider>,
    );
};

const jsonResponse = (body: unknown) => {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
    });
};

const ProtectedAction = () => {
    const {request} = useApiTransport();
    return <button onClick={() => void request('/api/v1/ratings', {method: 'POST'})}>Save rating</button>;
};
