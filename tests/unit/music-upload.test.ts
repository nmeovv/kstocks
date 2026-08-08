import {beforeEach, describe, expect, it, vi} from 'vitest';

import {uploadMusicRelease} from '@/api/music-upload';
import type {components} from '@/api/generated/schema';
import {
    RELEASE_UPLOAD_STORAGE_KEY,
    loadReleaseUploadDraft,
    saveReleaseUploadDraft,
} from '@/features/music/release-upload/draft-storage';

const draft = {
    name: 'Armageddon',
    releaseType: 'album',
    releaseDate: '2024-05-27',
    artistCredits: ['aespa'],
    tracks: [],
} satisfies components['schemas']['MusicReleaseDraft'];

beforeEach(() => window.localStorage.clear());

describe('release upload draft storage', () => {
    it('restores a compatible versioned draft', () => {
        saveReleaseUploadDraft({url: 'https://open.spotify.com/album/1234567890123456789012', draft});
        expect(loadReleaseUploadDraft()).toEqual({
            url: 'https://open.spotify.com/album/1234567890123456789012',
            draft,
        });
    });

    it('silently removes malformed saved data', () => {
        window.localStorage.setItem(RELEASE_UPLOAD_STORAGE_KEY, '{broken');
        expect(loadReleaseUploadDraft()).toBeNull();
        expect(window.localStorage.getItem(RELEASE_UPLOAD_STORAGE_KEY)).toBeNull();
    });

    it('rejects drafts that only resemble the OpenAPI shape', () => {
        window.localStorage.setItem(
            RELEASE_UPLOAD_STORAGE_KEY,
            JSON.stringify({
                version: 1,
                payload: {
                    url: 'https://open.spotify.com/album/1234567890123456789012',
                    draft: {...draft, releaseDate: 'not-a-date'},
                },
            }),
        );

        expect(loadReleaseUploadDraft()).toBeNull();
    });
});

describe('release upload error boundaries', () => {
    it('parses structured validation errors without trusting the response body', async () => {
        const request = vi.fn().mockResolvedValue({
            ok: false,
            kind: 'application',
            status: 400,
            body: {errors: [{path: 'name', code: 'required', message: 'Name is required.'}, {bad: true}]},
        });
        const result = await uploadMusicRelease({request, draft});
        expect(result).toEqual({
            ok: false,
            failure: {kind: 'validation', errors: [{path: 'name', code: 'required', message: 'Name is required.'}]},
        });
    });

    it('accepts only the planned duplicate response shape', async () => {
        const request = vi.fn().mockResolvedValue({
            ok: false,
            kind: 'application',
            status: 409,
            body: {releaseId: 101, code: 'spotify_release_exists'},
        });
        const result = await uploadMusicRelease({request, draft});
        expect(result).toEqual({
            ok: false,
            failure: {kind: 'duplicate', duplicate: {releaseId: 101, code: 'spotify_release_exists'}},
        });
    });

    it('rejects malformed success bodies at the API boundary', async () => {
        const request = vi.fn().mockResolvedValue({ok: true, data: {releaseId: '911'}});

        await expect(uploadMusicRelease({request, draft})).resolves.toEqual({
            ok: false,
            failure: {kind: 'error'},
        });
    });
});
