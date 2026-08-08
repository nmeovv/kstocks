import type {components} from '@/api/generated/schema';

export type MusicReleaseDraft = components['schemas']['MusicReleaseDraft'];

export const RELEASE_UPLOAD_STORAGE_KEY = 'album-ratings:release-upload:v1';

const DRAFT_KEYS = new Set([
    'name',
    'releaseType',
    'releaseDate',
    'artistCredits',
    'image',
    'tracks',
    'spotifyReference',
]);
const TRACK_KEYS = new Set([
    'title',
    'discNumber',
    'trackNumber',
    'durationMs',
    'explicit',
    'artistCredits',
    'spotifyReference',
]);
const IMAGE_KEYS = new Set(['source', 'uri', 'width', 'height']);
const SPOTIFY_REFERENCE_KEYS = new Set(['id', 'url']);
const ENVELOPE_KEYS = new Set(['version', 'payload']);
const PAYLOAD_KEYS = new Set(['url', 'draft']);

export type SavedReleaseUploadDraft = {
    url: string;
    draft: MusicReleaseDraft;
};

export const loadReleaseUploadDraft = (): SavedReleaseUploadDraft | null => {
    const stored = window.localStorage.getItem(RELEASE_UPLOAD_STORAGE_KEY);
    if (!stored) {
        return null;
    }
    try {
        const value: unknown = JSON.parse(stored);
        if (isSavedEnvelope(value)) {
            return value.payload;
        }
    } catch {
        // Incompatible drafts are intentionally discarded below.
    }
    clearReleaseUploadDraft();
    return null;
};

export const saveReleaseUploadDraft = (value: SavedReleaseUploadDraft) => {
    window.localStorage.setItem(RELEASE_UPLOAD_STORAGE_KEY, JSON.stringify({version: 1, payload: value}));
};

export const clearReleaseUploadDraft = () => {
    window.localStorage.removeItem(RELEASE_UPLOAD_STORAGE_KEY);
};

const isSavedEnvelope = (value: unknown): value is {version: 1; payload: SavedReleaseUploadDraft} => {
    if (
        !isRecord(value) ||
        !hasOnlyKeys(value, ENVELOPE_KEYS) ||
        value.version !== 1 ||
        !isRecord(value.payload) ||
        !hasOnlyKeys(value.payload, PAYLOAD_KEYS)
    ) {
        return false;
    }
    return isUri(value.payload.url) && isMusicReleaseDraft(value.payload.draft);
};

export const isMusicReleaseDraft = (value: unknown): value is MusicReleaseDraft => {
    if (!isRecord(value) || !hasOnlyKeys(value, DRAFT_KEYS)) {
        return false;
    }
    return (
        isNonEmptyString(value.name) &&
        isReleaseType(value.releaseType) &&
        isOptional(value.releaseDate, isDate) &&
        isStringArray(value.artistCredits) &&
        Array.isArray(value.tracks) &&
        value.tracks.every(isDraftTrack) &&
        isOptional(value.image, isDraftImage) &&
        isOptional(value.spotifyReference, isSpotifyReference)
    );
};

const isDraftTrack = (value: unknown) => {
    return (
        isRecord(value) &&
        hasOnlyKeys(value, TRACK_KEYS) &&
        isNonEmptyString(value.title) &&
        typeof value.explicit === 'boolean' &&
        isStringArray(value.artistCredits) &&
        isOptional(value.discNumber, isPositiveInteger) &&
        isOptional(value.trackNumber, isPositiveInteger) &&
        isOptional(value.durationMs, isNonNegativeInteger) &&
        isOptional(value.spotifyReference, isSpotifyReference)
    );
};

const isDraftImage = (value: unknown) => {
    return (
        isRecord(value) &&
        hasOnlyKeys(value, IMAGE_KEYS) &&
        (value.source === 'spotify' || value.source === 'custom' || value.source === 'local') &&
        isNonEmptyString(value.uri) &&
        isOptional(value.width, isPositiveInteger) &&
        isOptional(value.height, isPositiveInteger)
    );
};

const isSpotifyReference = (value: unknown) => {
    return (
        isRecord(value) &&
        hasOnlyKeys(value, SPOTIFY_REFERENCE_KEYS) &&
        typeof value.id === 'string' &&
        /^[A-Za-z0-9]{22}$/.test(value.id) &&
        isUri(value.url)
    );
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(isNonEmptyString);
};

const hasOnlyKeys = (value: Record<string, unknown>, allowed: Set<string>) => {
    return Object.keys(value).every(key => allowed.has(key));
};

const isOptional = (value: unknown, predicate: (candidate: unknown) => boolean) => {
    return value === undefined || value === null || predicate(value);
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const isReleaseType = (value: unknown): value is MusicReleaseDraft['releaseType'] => {
    return value === 'album' || value === 'ep' || value === 'single' || value === 'compilation' || value === 'other';
};

const isPositiveInteger = (value: unknown) => Number.isSafeInteger(value) && Number(value) > 0;

const isNonNegativeInteger = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0;

const isDate = (value: unknown) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
};

const isUri = (value: unknown): value is string => {
    if (typeof value !== 'string' || value.length === 0) {
        return false;
    }
    try {
        void new URL(value);
        return true;
    } catch {
        return false;
    }
};
