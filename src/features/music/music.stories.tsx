import type {Meta, StoryObj} from '@storybook/react-vite';

import {MusicChartsContent} from './charts/music-charts-content';
import {
    currentRatings,
    musicArtists,
    ratedReleases,
    ratedTracks,
    releaseDetail,
    releaseOverview,
    releaseSummaries,
    trackOverview,
    voterRatings,
} from './fixtures';
import {MusicMyRatingsContent} from './my-ratings/my-ratings-content';
import {MusicReleaseDetailContent} from './release-detail/release-detail-content';
import MusicReleaseListDesktopView from './release-list/index.desktop';
import MusicReleaseListTouchView from './release-list/index.touch';
import {MusicVoterList, ReleaseRatingView, TrackRatingView} from './rating-controls';

const meta = {
    title: 'Features/Music',
    parameters: {layout: 'fullscreen'},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const storyFrame = (children: React.ReactNode) => (
    <div style={{maxWidth: '70rem', minHeight: '100vh', margin: '0 auto', padding: '2rem 1rem 4rem'}}>{children}</div>
);

const noAction = async () => undefined;

export const ReleaseListPopulated: Story = {
    render: () =>
        storyFrame(
            <MusicReleaseListDesktopView
                artistSearch=""
                onArtistSearchChange={() => undefined}
                onRetry={() => undefined}
                onSelectArtist={() => undefined}
                state={{
                    kind: 'ready',
                    artists: musicArtists,
                    selectedArtist: musicArtists[0],
                    releases: {kind: 'populated', items: releaseSummaries},
                }}
            />,
        ),
};

export const ReleaseListLoading: Story = {
    render: () =>
        storyFrame(
            <MusicReleaseListTouchView
                artistSearch=""
                onArtistSearchChange={() => undefined}
                onRetry={() => undefined}
                onSelectArtist={() => undefined}
                state={{kind: 'catalog-loading'}}
            />,
        ),
};

export const ReleaseListEmpty: Story = {
    render: () =>
        storyFrame(
            <MusicReleaseListTouchView
                artistSearch=""
                onArtistSearchChange={() => undefined}
                onRetry={() => undefined}
                onSelectArtist={() => undefined}
                state={{
                    kind: 'ready',
                    artists: musicArtists,
                    selectedArtist: musicArtists[0],
                    releases: {kind: 'empty'},
                }}
            />,
        ),
};

export const ReleaseListError: Story = {
    render: () =>
        storyFrame(
            <MusicReleaseListTouchView
                artistSearch=""
                onArtistSearchChange={() => undefined}
                onRetry={() => undefined}
                onSelectArtist={() => undefined}
                state={{kind: 'catalog-error'}}
            />,
        ),
};

export const ReleaseDetailWithArtwork: Story = {
    render: () =>
        storyFrame(
            <MusicReleaseDetailContent
                detail={releaseDetail}
                onRetry={() => undefined}
                releaseId={101}
                releaseRating={<ReleaseRatingStory />}
                status="ready"
                trackRating={track => <TrackRatingStory key={track.id} trackId={track.id} trackName={track.title} />}
            />,
        ),
};

export const ReleaseDetailWithoutArtwork: Story = {
    render: () =>
        storyFrame(
            <MusicReleaseDetailContent
                desktop
                detail={{...releaseDetail, release: {...releaseDetail.release, selectedCover: null}, images: []}}
                onRetry={() => undefined}
                releaseId={101}
                releaseRating={<ReleaseRatingStory />}
                status="ready"
                trackRating={track => <TrackRatingStory key={track.id} trackId={track.id} trackName={track.title} />}
            />,
        ),
};

export const ReleaseRatingUnrated: Story = {
    render: () => storyFrame(<ReleaseRatingStory overview={{aggregate: null, current: null}} />),
};

export const ReleaseRatingCurrentAndAggregate: Story = {
    render: () => storyFrame(<ReleaseRatingStory />),
};

export const ReleaseRatingSaving: Story = {
    render: () => storyFrame(<ReleaseRatingStory saving />),
};

export const ReleaseRatingError: Story = {
    render: () => storyFrame(<ReleaseRatingStory error />),
};

export const TrackRatingStates: Story = {
    render: () =>
        storyFrame(
            <div style={{display: 'grid', gap: '1rem'}}>
                <TrackRatingStory trackId={201} trackName="Supernova" />
                <TrackRatingStory trackId={202} trackName="Armageddon" overview={{current: null, aggregate: null}} />
                <TrackRatingStory error trackId={203} trackName="Long Chat" />
            </div>,
        ),
};

export const VotersIncludingDeletedUser: Story = {
    render: () => storyFrame(<MusicVoterList voters={voterRatings} />),
};

export const MixedCurrentRatings: Story = {
    render: () =>
        storyFrame(
            <MusicMyRatingsContent desktop onRetry={() => undefined} ratings={currentRatings} status="populated" />,
        ),
};

export const ChartsByAverage: Story = {
    render: () =>
        storyFrame(
            <MusicChartsContent
                criterion="average"
                desktop
                onRetry={() => undefined}
                releases={ratedReleases}
                status="ready"
                tracks={ratedTracks}
            />,
        ),
};

export const ChartsByAnyVote: Story = {
    render: () =>
        storyFrame(
            <MusicChartsContent
                criterion="any"
                onRetry={() => undefined}
                releases={ratedReleases}
                status="ready"
                tracks={ratedTracks}
            />,
        ),
};

const ReleaseRatingStory = ({
    error = false,
    overview = releaseOverview,
    saving = false,
}: {
    error?: boolean;
    overview?: typeof releaseOverview;
    saving?: boolean;
}) => (
    <ReleaseRatingView
        error={error}
        loading={false}
        onClear={noAction}
        onRetry={() => undefined}
        onSave={noAction}
        overview={overview}
        releaseId={101}
        releaseName="Armageddon"
        saving={saving}
        votersControl={null}
    />
);

const TrackRatingStory = ({
    error = false,
    overview = trackOverview,
    trackId,
    trackName,
}: {
    error?: boolean;
    overview?: typeof trackOverview;
    trackId: number;
    trackName: string;
}) => (
    <TrackRatingView
        error={error}
        loading={false}
        onClear={noAction}
        onRetry={() => undefined}
        onSave={noAction}
        overview={overview}
        saving={false}
        trackId={trackId}
        trackName={trackName}
        votersControl={null}
    />
);
