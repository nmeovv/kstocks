import type {components, operations} from '@/api/generated/schema';
import type {ApiResult} from '@/api/http';

export type SpotifyPreviewRequest = operations['previewSpotifyRelease']['requestBody']['content']['application/json'];
export type MusicReleaseDraft = components['schemas']['MusicReleaseDraft'];
export type MusicReleaseUploadResponse = components['schemas']['MusicReleaseUploadResponse'];
export type UploadFieldError = components['schemas']['UploadFieldError'];
export type UploadDuplicate = components['schemas']['SpotifyReleaseExistsError'];
export type MusicUploadRequest = (path: string, init?: RequestInit) => Promise<ApiResult<unknown>>;

export type SpotifyPreviewFailure =
    {kind: 'unauthenticated'} | {kind: 'spotify-unavailable'} | {kind: 'invalid-spotify-url'} | {kind: 'error'};

export type MusicReleaseUploadFailure =
    | {kind: 'unauthenticated'}
    | {kind: 'duplicate'; duplicate: UploadDuplicate}
    | {kind: 'validation'; errors: UploadFieldError[]}
    | {kind: 'error'};

export type UploadResult<T, Failure> = {ok: true; data: T} | {ok: false; failure: Failure};

export const previewSpotifyRelease = async ({
    request,
    body,
    isDraft,
}: {
    request: MusicUploadRequest;
    body: SpotifyPreviewRequest;
    isDraft: (value: unknown) => value is MusicReleaseDraft;
}): Promise<UploadResult<MusicReleaseDraft, SpotifyPreviewFailure>> => {
    const result = await request('/api/v1/music/releases/spotify/preview', jsonInit(body));
    if (result.ok) {
        return isDraft(result.data) ? {ok: true, data: result.data} : {ok: false, failure: {kind: 'error'}};
    }
    if (result.status === 400) {
        return {ok: false, failure: {kind: 'invalid-spotify-url'}};
    }
    if (result.status === 502) {
        return {ok: false, failure: {kind: 'spotify-unavailable'}};
    }
    return {ok: false, failure: result.kind === 'unauthenticated' ? {kind: 'unauthenticated'} : {kind: 'error'}};
};

export const uploadMusicRelease = async ({
    request,
    draft,
}: {
    request: MusicUploadRequest;
    draft: MusicReleaseDraft;
}): Promise<UploadResult<MusicReleaseUploadResponse, MusicReleaseUploadFailure>> => {
    const result = await request('/api/v1/music/releases', jsonInit(draft));
    if (result.ok) {
        return isUploadResponse(result.data) ? {ok: true, data: result.data} : {ok: false, failure: {kind: 'error'}};
    }
    if (result.kind === 'unauthenticated') {
        return {ok: false, failure: {kind: 'unauthenticated'}};
    }
    if (result.status === 409) {
        const duplicate = parseDuplicate(result.body);
        return duplicate ? {ok: false, failure: {kind: 'duplicate', duplicate}} : {ok: false, failure: {kind: 'error'}};
    }
    if (result.status === 400) {
        return {ok: false, failure: {kind: 'validation', errors: parseFieldErrors(result.body)}};
    }
    return {ok: false, failure: {kind: 'error'}};
};

export const isSpotifyAlbumUrl = (value: string) => {
    try {
        const url = new URL(value);
        return (
            url.protocol === 'https:' &&
            url.hostname === 'open.spotify.com' &&
            /^\/album\/[A-Za-z0-9]{22}\/?$/.test(url.pathname)
        );
    } catch {
        return false;
    }
};

const jsonInit = (body: unknown): RequestInit => ({
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
});

const parseDuplicate = (value: unknown): UploadDuplicate | null => {
    if (!isRecord(value) || value.code !== 'spotify_release_exists') {
        return null;
    }
    return typeof value.releaseId === 'number' && Number.isSafeInteger(value.releaseId) && value.releaseId > 0
        ? {releaseId: value.releaseId, code: value.code}
        : null;
};

const parseFieldErrors = (value: unknown): UploadFieldError[] => {
    if (!isRecord(value) || !Array.isArray(value.errors)) {
        return [];
    }
    return value.errors.flatMap(error => {
        if (
            !isRecord(error) ||
            typeof error.path !== 'string' ||
            typeof error.code !== 'string' ||
            typeof error.message !== 'string'
        ) {
            return [];
        }
        return [{path: error.path, code: error.code, message: error.message}];
    });
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isUploadResponse = (value: unknown): value is MusicReleaseUploadResponse => {
    return (
        isRecord(value) &&
        typeof value.releaseId === 'number' &&
        Number.isSafeInteger(value.releaseId) &&
        value.releaseId > 0
    );
};
