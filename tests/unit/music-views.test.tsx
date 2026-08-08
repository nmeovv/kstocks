import {expect, it, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';

import {MusicChartsContent} from '@/features/music/charts/music-charts-content';
import {currentRatings, musicArtists, ratedReleases, ratedTracks, releaseSummaries} from '@/features/music/fixtures';
import {MusicMyRatingsContent} from '@/features/music/my-ratings/my-ratings-content';
import MusicReleaseListDesktopView from '@/features/music/release-list/index.desktop';
import MusicReleaseListTouchView from '@/features/music/release-list/index.touch';
import {AppI18nProvider} from '@/i18n';

it.each([
    [{kind: 'catalog-loading'}, 'Find an artist'],
    [{kind: 'catalog-empty'}, 'No artists are in the catalog yet.'],
    [{kind: 'catalog-error'}, 'Artists are unavailable.'],
] satisfies ReadonlyArray<readonly [{kind: 'catalog-loading' | 'catalog-empty' | 'catalog-error'}, string]>)(
    'renders the release list $state.kind state',
    (state, expected) => {
        renderView(
            <MusicReleaseListTouchView
                artistSearch=""
                onArtistSearchChange={vi.fn()}
                onRetry={vi.fn()}
                onSelectArtist={vi.fn()}
                state={state}
            />,
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
    },
);

it('renders artist selection and populated releases as accessible detail links', async () => {
    const user = userEvent.setup();
    const onSelectArtist = vi.fn();
    renderView(
        <MusicReleaseListDesktopView
            artistSearch=""
            onArtistSearchChange={vi.fn()}
            onRetry={vi.fn()}
            onSelectArtist={onSelectArtist}
            state={{
                kind: 'ready',
                artists: musicArtists,
                selectedArtist: musicArtists[0],
                releases: {kind: 'populated', items: releaseSummaries},
            }}
        />,
    );

    await user.click(screen.getByRole('button', {name: 'Red Velvet'}));
    expect(onSelectArtist).toHaveBeenCalledWith(musicArtists[1]);
    expect(screen.getByRole('link', {name: /Armageddon/})).toHaveAttribute('href', '/music/releases/101');
    expect(within(screen.getByRole('region', {name: 'aespa releases'})).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByText(/unassociated|Group ID|Idol ID/i)).not.toBeInTheDocument();
});

it('keeps date-only release values on the same calendar day west of UTC', () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';

    try {
        renderView(
            <MusicReleaseListTouchView
                artistSearch=""
                onArtistSearchChange={vi.fn()}
                onRetry={vi.fn()}
                onSelectArtist={vi.fn()}
                state={{
                    kind: 'ready',
                    artists: musicArtists,
                    selectedArtist: musicArtists[0],
                    releases: {kind: 'populated', items: [releaseSummaries[0]]},
                }}
            />,
        );

        expect(screen.getByText('May 27')).toBeInTheDocument();
    } finally {
        process.env.TZ = previousTimezone;
    }
});

it('keeps track ratings unlinked when the API provides no parent release ID', () => {
    renderView(<MusicMyRatingsContent onRetry={vi.fn()} ratings={currentRatings} status="populated" />);

    expect(screen.getByRole('link', {name: /Armageddon/})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: /Supernova/})).not.toBeInTheDocument();
});

it('renders both chart criteria in URL-addressable links', () => {
    renderView(
        <MusicChartsContent
            criterion="average"
            onRetry={vi.fn()}
            releases={ratedReleases}
            status="ready"
            tracks={ratedTracks}
        />,
    );

    expect(screen.getByRole('link', {name: 'Average 7+'})).toHaveAttribute('href', '/?criterion=average');
    expect(screen.getByRole('link', {name: 'Any 7+ vote'})).toHaveAttribute('href', '/?criterion=any');
    expect(screen.queryByRole('link', {name: /Supernova/})).not.toBeInTheDocument();
});

const renderView = (children: React.ReactNode) => {
    return render(
        <AppI18nProvider>
            <MemoryRouter>{children}</MemoryRouter>
        </AppI18nProvider>,
    );
};
