import type {
    MusicArtistSummary,
    MusicRatedTarget,
    MusicReleaseDetail,
    MusicReleaseRatingOverview,
    MusicReleaseSummary,
    MusicTrackRatingOverview,
    MusicUserRating,
    MusicVoterRating,
} from '@/api/music';

export const musicArtwork = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#ff5b35"/>
  <circle cx="300" cy="300" r="210" fill="#26201a"/>
  <circle cx="300" cy="300" r="150" fill="none" stroke="#ffb9cc" stroke-width="28"/>
  <path d="M135 330 300 90l165 240-165 180z" fill="#ffd84d"/>
  <circle cx="300" cy="300" r="34" fill="#a5dcff" stroke="#26201a" stroke-width="12"/>
</svg>`)} `;

export const releaseSummaries: MusicReleaseSummary[] = [
    {
        id: 101,
        name: 'Armageddon',
        releaseType: 'album',
        releaseDate: '2024-05-27',
        artistCredits: ['aespa'],
        selectedCover: {id: 1, source: 'custom', uri: musicArtwork, width: 600, height: 600, preferred: true},
    },
    {
        id: 102,
        name: 'The Perfect Red Velvet',
        releaseType: 'album',
        releaseDate: '2018-01-29',
        artistCredits: ['Red Velvet'],
        selectedCover: null,
    },
    {
        id: 103,
        name: 'Max & Match',
        releaseType: 'ep',
        releaseDate: '2017-10-31',
        artistCredits: ['LOONA / ODD EYE CIRCLE'],
        selectedCover: null,
    },
];

export const musicArtists: MusicArtistSummary[] = [
    {kind: 'group', id: 44, name: 'aespa'},
    {kind: 'group', id: 45, name: 'Red Velvet'},
    {kind: 'idol', id: 87, name: 'NINGNING'},
    {kind: 'idol', id: 88, name: 'WENDY'},
];

export const releaseDetail: MusicReleaseDetail = {
    release: releaseSummaries[0],
    images: [{id: 1, source: 'custom', uri: musicArtwork, width: 600, height: 600, preferred: true}],
    groups: [{id: 44, name: 'aespa'}],
    idols: [{id: 87, name: 'NINGNING'}],
    tracks: [
        {
            id: 201,
            title: 'Supernova',
            discNumber: 1,
            trackNumber: 1,
            durationMs: 178880,
            explicit: false,
            artistCredits: ['aespa'],
        },
        {
            id: 202,
            title: 'Armageddon',
            discNumber: 1,
            trackNumber: 2,
            durationMs: 196720,
            explicit: true,
            artistCredits: ['aespa', 'NINGNING'],
        },
        {
            id: 203,
            title: 'Long Chat (#♥)',
            discNumber: 2,
            trackNumber: 1,
            durationMs: 195140,
            explicit: false,
            artistCredits: ['aespa'],
        },
    ],
};

export const releaseOverview: MusicReleaseRatingOverview = {
    current: {score: 8, strength: 'strong'},
    aggregate: {average: 8.4, voterCount: 12},
    nearestAggregateState: {score: 8, strength: 'strong'},
};

export const trackOverview: MusicTrackRatingOverview = {
    current: {score: 9},
    aggregate: {average: 8.6, voterCount: 8},
};

export const voterRatings: MusicVoterRating[] = [
    {userId: 1, displayName: 'vinylcat', score: 9, strength: 'weak', updatedAt: '2026-08-20T10:30:00Z'},
    {userId: null, displayName: 'deleted user', score: 8, strength: 'strong', updatedAt: '2026-08-19T09:00:00Z'},
];

export const currentRatings: MusicUserRating[] = [
    {
        targetType: 'release',
        targetId: 101,
        targetName: 'Armageddon',
        score: 8,
        strength: 'strong',
        updatedAt: '2026-08-20T10:30:00Z',
    },
    {targetType: 'track', targetId: 201, targetName: 'Supernova', score: 9, updatedAt: '2026-08-19T10:30:00Z'},
];

export const ratedReleases: MusicRatedTarget[] = [
    {id: 101, name: 'Armageddon', voterCount: 12, average: 8.4},
    {id: 102, name: 'The Perfect Red Velvet', voterCount: 18, average: 8.2},
];

export const ratedTracks: MusicRatedTarget[] = [
    {id: 201, name: 'Supernova', voterCount: 8, average: 8.6},
    {id: 204, name: 'Cosmic', voterCount: 6, average: 8.1},
];
