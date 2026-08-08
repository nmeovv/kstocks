import {describe, expect, it, vi} from 'vitest';

import {
    MusicApiError,
    createMusicClient,
    musicKeys,
    parseArtistSelection,
    parseTrackCriterion,
    releaseRatingStates,
    shouldRetryMusicRequest,
    type MusicRequest,
    type MusicArtistSelection,
    type MusicReleaseRatingValue,
} from '@/api/music';

describe('music API client', () => {
    it.each([
        [{kind: 'group', id: 44}, '/api/v1/music/releases?groupId=44'],
        [{kind: 'idol', id: 87}, '/api/v1/music/releases?idolId=87'],
    ] satisfies ReadonlyArray<readonly [MusicArtistSelection, string]>)(
        'builds the exact release-list path for %o',
        async (filter, path) => {
            const request = vi.fn<MusicRequest>().mockResolvedValue({ok: true, data: []});

            await createMusicClient(request).listReleases(filter);

            expect(request).toHaveBeenCalledWith(path);
        },
    );

    it('loads the artist catalog from its authoritative endpoint', async () => {
        const request = vi.fn<MusicRequest>().mockResolvedValue({
            ok: true,
            data: [
                {kind: 'group', id: 44, name: 'aespa'},
                {kind: 'idol', id: 87, name: 'NINGNING'},
            ],
        });

        await expect(createMusicClient(request).listArtists()).resolves.toHaveLength(2);
        expect(request).toHaveBeenCalledWith('/api/v1/music/artists');
    });

    it('sends the exact release and track rating bodies and clear methods', async () => {
        const request = vi.fn<MusicRequest>().mockResolvedValue({ok: true, data: {changed: true}});
        const client = createMusicClient(request);

        await client.setReleaseRating(101, {score: 8, strength: 'strong'});
        await client.setTrackRating(201, {score: 9});
        await client.clearTrackRating(201);

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/music/releases/101/rating', {
            method: 'PUT',
            body: JSON.stringify({score: 8, strength: 'strong'}),
            headers: {'Content-Type': 'application/json'},
        });
        expect(request).toHaveBeenNthCalledWith(2, '/api/v1/music/tracks/201/rating', {
            method: 'PUT',
            body: JSON.stringify({score: 9}),
            headers: {'Content-Type': 'application/json'},
        });
        expect(request).toHaveBeenNthCalledWith(3, '/api/v1/music/tracks/201/rating', {method: 'DELETE'});
    });

    it('normalizes endpoint release scores by removing strength', async () => {
        const request = vi.fn<MusicRequest>().mockResolvedValue({ok: true, data: {changed: true}});
        const client = createMusicClient(request);

        await client.setReleaseRating(101, {score: 10});
        await client.setReleaseRating(101, {score: 0});

        expect(request.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({score: 10}));
        expect(request.mock.calls[1]?.[1]?.body).toBe(JSON.stringify({score: 0}));
    });

    it.each([
        {score: 0, strength: 'weak'},
        {score: 10, strength: 'strong'},
        {score: 8},
        {score: 11},
    ] satisfies MusicReleaseRatingValue[])('rejects invalid release state %o before a request', async value => {
        const request = vi.fn<MusicRequest>();
        const client = createMusicClient(request);

        expect(() => client.setReleaseRating(101, value)).toThrow(MusicApiError);
        expect(request).not.toHaveBeenCalled();
    });

    it.each([0, 1.5, 11])('rejects out-of-range track score %s before a request', async score => {
        const request = vi.fn<MusicRequest>();

        expect(() => createMusicClient(request).setTrackRating(201, {score})).toThrow(MusicApiError);
        expect(request).not.toHaveBeenCalled();
    });

    it('turns unsuccessful API results into typed application errors', async () => {
        const request = vi.fn<MusicRequest>().mockResolvedValue({ok: false, kind: 'unauthenticated', status: 401});

        await expect(createMusicClient(request).listMyRatings()).rejects.toMatchObject({
            kind: 'unauthenticated',
            status: 401,
        });
    });

    it('rejects malformed successful responses at the transport boundary', async () => {
        const request = vi.fn<MusicRequest>().mockResolvedValue({
            ok: true,
            data: [
                {
                    id: 101,
                    name: 'Armageddon',
                    releaseType: 'album',
                    releaseDate: '2024-05-27',
                    artistCredits: ['aespa'],
                },
            ],
        });

        await expect(createMusicClient(request).listReleases({kind: 'group', id: 44})).rejects.toMatchObject({
            kind: 'application',
            status: 502,
        });
    });

    it('isolates user-specific rating caches by authenticated user ID', () => {
        expect(musicKeys.releaseRating(101, 7)).not.toEqual(musicKeys.releaseRating(101, 8));
        expect(musicKeys.trackRating(201, 7)).not.toEqual(musicKeys.trackRating(201, 8));
        expect(musicKeys.myRatings(7)).not.toEqual(musicKeys.myRatings(8));
    });
});

describe('music route parsing and retry policy', () => {
    it('leaves an empty release URL ready to select the first catalog artist', () => {
        expect(parseArtistSelection(new URLSearchParams())).toBeNull();
    });

    it.each([
        ['groupId=44', {kind: 'group', id: 44}],
        ['idolId=87', {kind: 'idol', id: 87}],
    ] satisfies ReadonlyArray<readonly [string, MusicArtistSelection]>)(
        'parses the artist selection %s',
        (query, expected) => {
            expect(parseArtistSelection(new URLSearchParams(query))).toEqual(expected);
        },
    );

    it.each(['groupId=44&idolId=87', 'groupId=0', 'unassociated=true', 'groupId=word'])(
        'rejects invalid exact-filter state %s',
        query => {
            expect(() => parseArtistSelection(new URLSearchParams(query))).toThrow(MusicApiError);
        },
    );

    it('parses supported chart criteria and safely defaults unknown values', () => {
        expect(parseTrackCriterion('any')).toBe('any');
        expect(parseTrackCriterion('average')).toBe('average');
        expect(parseTrackCriterion('something-else')).toBe('average');
    });

    it('contains exactly the 29 legal release states', () => {
        const states = releaseRatingStates();
        expect(states).toHaveLength(29);
        expect(states[0]).toEqual({score: 0});
        expect(states.at(-1)).toEqual({score: 10});
        expect(states.filter(state => state.score > 0 && state.score < 10)).toHaveLength(27);
    });

    it('retries network/server failures briefly but never retries client failures', () => {
        expect(shouldRetryMusicRequest(0, new MusicApiError('offline', 'network'))).toBe(true);
        expect(shouldRetryMusicRequest(1, new MusicApiError('server', 'application', 503))).toBe(true);
        expect(shouldRetryMusicRequest(2, new MusicApiError('server', 'application', 503))).toBe(false);
        expect(shouldRetryMusicRequest(0, new MusicApiError('missing', 'application', 404))).toBe(false);
        expect(shouldRetryMusicRequest(0, new MusicApiError('login', 'unauthenticated', 401))).toBe(false);
    });
});
