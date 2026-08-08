import type {Page} from '@playwright/test';

import type {components, operations} from '../../../src/api/generated/schema';
import {isMusicReleaseDraft} from '../../../src/features/music/release-upload/draft-storage';

type PreviewRequest = operations['previewSpotifyRelease']['requestBody']['content']['application/json'];
type PreviewResponse = operations['previewSpotifyRelease']['responses'][200]['content']['application/json'];
type UploadRequest = operations['uploadMusicRelease']['requestBody']['content']['application/json'];
type UploadResponse = operations['uploadMusicRelease']['responses'][201]['content']['application/json'];

type MockReply<Body> = {status: number; body?: Body | unknown};

export type MusicUploadMockOptions = {
    preview?: MockReply<PreviewResponse>;
    upload?: MockReply<UploadResponse>;
};

export type MusicUploadRequests = {
    previews: PreviewRequest[];
    uploads: UploadRequest[];
};

export const spotifyPreview = {
    name: 'Armageddon',
    releaseType: 'album',
    releaseDate: '2024-05-27',
    artistCredits: ['aespa'],
    image: {
        source: 'spotify',
        uri: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect width="300" height="300" fill="%23ff5b35"/%3E%3C/svg%3E',
        width: 300,
        height: 300,
    },
    spotifyReference: {id: '1234567890123456789012', url: 'https://open.spotify.com/album/1234567890123456789012'},
    tracks: [
        {
            title: 'Supernova',
            discNumber: 1,
            trackNumber: 1,
            durationMs: 178880,
            explicit: false,
            artistCredits: ['aespa'],
            spotifyReference: {
                id: 'abcdefghijklmnopqrstuv',
                url: 'https://open.spotify.com/track/abcdefghijklmnopqrstuv',
            },
        },
        {
            title: 'Armageddon',
            discNumber: 1,
            trackNumber: 2,
            durationMs: 196720,
            explicit: true,
            artistCredits: ['aespa'],
            spotifyReference: {
                id: 'zyxwvutsrqponmlkjihgfe',
                url: 'https://open.spotify.com/track/zyxwvutsrqponmlkjihgfe',
            },
        },
    ],
} satisfies components['schemas']['MusicReleaseDraft'];

export const mockMusicUploadApi = async (page: Page, options: MusicUploadMockOptions = {}) => {
    const requests: MusicUploadRequests = {previews: [], uploads: []};
    await page.route('**/api/v1/auth/session', route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                authenticated: true,
                user: {id: 7, username: 'listener', firstName: 'Mina', lastName: null, avatarUrl: null},
            }),
        }),
    );
    await page.route('**/api/v1/music/releases/spotify/preview', async route => {
        const body: unknown = route.request().postDataJSON();
        if (isPreviewRequest(body)) {
            requests.previews.push(body);
        }
        const reply = options.preview ?? {status: 200, body: spotifyPreview};
        return fulfill(route, reply);
    });
    await page.route('**/api/v1/music/releases', async route => {
        if (route.request().method() !== 'POST') {
            return route.fulfill({status: 404});
        }
        const body: unknown = route.request().postDataJSON();
        if (isMusicReleaseDraft(body)) {
            requests.uploads.push(body);
        }
        const reply = options.upload ?? {status: 201, body: {releaseId: 911} satisfies UploadResponse};
        return fulfill(route, reply);
    });
    await page.route('**/api/v1/music/releases?*', route =>
        route.fulfill({status: 200, contentType: 'application/json', body: '[]'}),
    );
    await page.route('**/api/v1/music/releases/*', route => route.fulfill({status: 404}));
    return requests;
};

const fulfill = (route: Parameters<Parameters<Page['route']>[1]>[0], reply: MockReply<unknown>) => {
    return route.fulfill({
        status: reply.status,
        contentType: 'application/json',
        body: JSON.stringify(reply.body ?? {}),
    });
};

const isPreviewRequest = (value: unknown): value is PreviewRequest => {
    return typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string';
};
