import {expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {PopupProvider} from '@/components/ui/popup';
import {MusicVoterList, ReleaseRatingView, TrackRatingView} from '@/features/music/rating-controls';
import {AppI18nProvider} from '@/i18n';

it('offers all 29 release states and saves the exact strong-eight value', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderMusic(
        <ReleaseRatingView
            error={false}
            loading={false}
            onClear={vi.fn()}
            onRetry={vi.fn()}
            onSave={onSave}
            overview={{current: null, aggregate: null}}
            releaseId={101}
            releaseName="Armageddon"
            saving={false}
            votersControl={null}
        />,
    );

    await user.click(screen.getByRole('button', {name: 'Rate Armageddon'}));
    expect(screen.getAllByRole('radio')).toHaveLength(29);

    await user.click(screen.getByRole('radio', {name: 'Strong 8'}));
    await user.click(screen.getByRole('button', {name: 'Save rating'}));

    expect(onSave).toHaveBeenCalledWith({score: 8, strength: 'strong'});
});

it('supports keyboard navigation through the native release radio group', async () => {
    const user = userEvent.setup();

    renderMusic(
        <ReleaseRatingView
            error={false}
            loading={false}
            onClear={vi.fn()}
            onRetry={vi.fn()}
            onSave={vi.fn().mockResolvedValue(undefined)}
            overview={{current: {score: 8, strength: 'decent'}, aggregate: null}}
            releaseId={101}
            releaseName="Armageddon"
            saving={false}
            votersControl={null}
        />,
    );

    await user.click(screen.getByRole('button', {name: 'Rate Armageddon'}));
    const current = screen.getByRole('radio', {name: 'Decent 8'});
    current.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', {name: 'Strong 8'})).toBeChecked();
});

it('saves and clears track ratings from the accessible popup', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClear = vi.fn().mockResolvedValue(undefined);

    const {rerender} = renderMusic(
        <TrackRatingView
            error={false}
            loading={false}
            onClear={onClear}
            onRetry={vi.fn()}
            onSave={onSave}
            overview={{current: null, aggregate: null}}
            saving={false}
            trackId={201}
            trackName="Supernova"
            votersControl={null}
        />,
    );

    await user.click(screen.getByRole('button', {name: 'Rate Supernova'}));
    await user.click(screen.getByRole('radio', {name: '9'}));
    await user.click(screen.getByRole('button', {name: 'Save rating'}));
    expect(onSave).toHaveBeenCalledWith(9);

    rerender(
        <AppI18nProvider>
            <PopupProvider platform="desktop">
                <TrackRatingView
                    error={false}
                    loading={false}
                    onClear={onClear}
                    onRetry={vi.fn()}
                    onSave={onSave}
                    overview={{current: {score: 9}, aggregate: {average: 8.6, voterCount: 2}}}
                    saving={false}
                    trackId={201}
                    trackName="Supernova"
                    votersControl={null}
                />
            </PopupProvider>
        </AppI18nProvider>,
    );
    await user.click(screen.getByRole('button', {name: 'Rate Supernova'}));
    await user.click(screen.getByRole('button', {name: 'Clear rating'}));
    expect(onClear).toHaveBeenCalledOnce();
});

it('renders an anonymized deleted voter without exposing an internal identity', () => {
    renderMusic(
        <MusicVoterList
            voters={[
                {
                    userId: null,
                    displayName: 'deleted user',
                    score: 8,
                    strength: 'strong',
                    updatedAt: '2026-08-20T10:00:00Z',
                },
            ]}
        />,
    );

    expect(screen.getByText('deleted user')).toBeVisible();
    expect(screen.getByText('Strong 8')).toBeVisible();
});

it('blocks release rating changes when the current rating fails to load', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderMusic(
        <ReleaseRatingView
            error={false}
            loadError
            loading={false}
            onClear={vi.fn()}
            onRetry={onRetry}
            onSave={vi.fn()}
            releaseId={101}
            releaseName="Armageddon"
            saving={false}
            votersControl={null}
        />,
    );

    expect(screen.queryByRole('button', {name: 'Rate Armageddon'})).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Retry'}));
    expect(onRetry).toHaveBeenCalledOnce();
});

it('blocks track rating changes when the current rating fails to load', () => {
    renderMusic(
        <TrackRatingView
            error={false}
            loadError
            loading={false}
            onClear={vi.fn()}
            onRetry={vi.fn()}
            onSave={vi.fn()}
            saving={false}
            trackId={201}
            trackName="Supernova"
            votersControl={null}
        />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('The rating could not be loaded.');
    expect(screen.queryByRole('button', {name: 'Rate Supernova'})).not.toBeInTheDocument();
});

const renderMusic = (children: React.ReactNode) => {
    return render(
        <AppI18nProvider>
            <PopupProvider platform="desktop">{children}</PopupProvider>
        </AppI18nProvider>,
    );
};
