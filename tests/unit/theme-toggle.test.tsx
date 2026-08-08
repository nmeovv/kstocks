import {afterEach, expect, it} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {ThemeToggle} from '@/components/ui/theme-toggle';
import {AppI18nProvider} from '@/i18n';

afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
});

it('switches the document theme and exposes the next action', async () => {
    const user = userEvent.setup();

    render(
        <AppI18nProvider>
            <ThemeToggle />
        </AppI18nProvider>,
    );

    const toggle = screen.getByRole('button', {name: 'Switch to dark mode'});
    await user.click(toggle);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('album-ratings-theme')).toBe('dark');
    expect(screen.getByRole('button', {name: 'Switch to light mode'})).toHaveAttribute('aria-pressed', 'true');
});

it('follows an externally selected theme such as the Storybook toolbar', async () => {
    render(
        <AppI18nProvider>
            <ThemeToggle />
        </AppI18nProvider>,
    );

    document.documentElement.dataset.theme = 'dark';

    await waitFor(() => {
        expect(screen.getByRole('button', {name: 'Switch to light mode'})).toHaveAttribute('aria-pressed', 'true');
    });
});
