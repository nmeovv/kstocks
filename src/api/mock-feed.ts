import type {FeedClient, FeedResponse} from '@/api/feed';

export const MOCK_FEED_RESPONSE = {
    items: [
        {
            id: 'rating-001',
            user: {
                id: 'user-maya',
                displayName: 'Maya Chen',
                handle: '@needleandgroove',
                initials: 'MC',
            },
            album: {
                id: 'album-blue-rev',
                title: 'Blue Rev',
                artist: 'Alvvays',
                releaseYear: 2022,
                artwork: 'ripple',
            },
            rating: 9.4,
            ratedAt: '2026-08-08T08:20:00.000Z',
        },
        {
            id: 'rating-002',
            user: {
                id: 'user-theo',
                displayName: 'Theo Martin',
                handle: '@sidetwo',
                initials: 'TM',
            },
            album: {
                id: 'album-promises',
                title: 'Promises',
                artist: 'Floating Points, Pharoah Sanders & LSO',
                releaseYear: 2021,
                artwork: 'orbit',
            },
            rating: 9.1,
            ratedAt: '2026-08-07T19:45:00.000Z',
        },
        {
            id: 'rating-003',
            user: {
                id: 'user-nora',
                displayName: 'Nora Bell',
                handle: '@quietpressing',
                initials: 'NB',
            },
            album: {
                id: 'album-titanic-rising',
                title: 'Titanic Rising',
                artist: 'Weyes Blood',
                releaseYear: 2019,
                artwork: 'bloom',
            },
            rating: 8.8,
            ratedAt: '2026-08-06T15:10:00.000Z',
        },
    ],
} satisfies FeedResponse;

export const mockFeedClient: FeedClient = {
    async getFeed() {
        return MOCK_FEED_RESPONSE;
    },
};
