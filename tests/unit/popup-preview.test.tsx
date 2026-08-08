import {expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {PopupProvider} from '@/components/ui/popup';
import {AppI18nProvider} from '@/i18n';
import {PopupPreview} from '@/stories/popup-preview';

it('exposes the popup header, selectable card controls, full-width action, and footer note', async () => {
    const user = userEvent.setup();

    render(
        <AppI18nProvider>
            <PopupProvider platform="desktop">
                <PopupPreview />
            </PopupProvider>
        </AppI18nProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'Open popup'}));

    expect(screen.getByText('Your rating')).toBeVisible();
    expect(screen.getByText('You can change this score at any time.')).toBeVisible();
    expect(screen.getByText('9.0')).toBeVisible();

    await user.click(screen.getByRole('radio', {name: '10'}));

    expect(screen.getByText('10.0')).toBeVisible();
    expect(screen.getByRole('button', {name: 'Save rating'})).toBeVisible();
});
