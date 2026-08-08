import type {components, operations} from '@/api/generated/schema';
import type {ApiResult} from '@/api/http';

export type MusicReleaseSummary = components['schemas']['MusicReleaseSummary'];
export type MusicReleaseDetail = components['schemas']['MusicReleaseDetail'];
export type MusicArtistSummary = components['schemas']['MusicArtistSummary'];
export type MusicTrack = components['schemas']['MusicTrack'];
export type MusicReleaseRatingValue = components['schemas']['MusicReleaseRatingValue'];
export type MusicTrackRatingValue = components['schemas']['MusicTrackRatingValue'];
export type MusicReleaseRatingOverview = components['schemas']['MusicReleaseRatingOverview'];
export type MusicTrackRatingOverview = components['schemas']['MusicTrackRatingOverview'];
export type MusicUserRating = components['schemas']['MusicUserRating'];
export type MusicRatedTarget = components['schemas']['MusicRatedTarget'];
export type MusicVoterRating = components['schemas']['MusicVoterRating'];
export type RatingMutationResponse = components['schemas']['RatingMutationResponse'];
export type MusicStrength = NonNullable<MusicReleaseRatingValue['strength']>;
export type MusicTrackCriterion = operations['listHighlyRatedMusicTracks']['parameters']['query']['criterion'];
type ArtistSelection<Artist> = Artist extends MusicArtistSummary ? Pick<Artist, 'id' | 'kind'> : never;
export type MusicArtistSelection = ArtistSelection<MusicArtistSummary>;

export type MusicRequest = (path: string, init?: RequestInit) => Promise<ApiResult<unknown>>;

export class MusicApiError extends Error {
    readonly kind: 'unauthenticated' | 'forbidden' | 'network' | 'application' | 'validation';
    readonly status?: number;

    constructor(
        message: string,
        kind: 'unauthenticated' | 'forbidden' | 'network' | 'application' | 'validation',
        status?: number,
    ) {
        super(message);
        this.name = 'MusicApiError';
        this.kind = kind;
        this.status = status;
    }
}

const queryKey = <const Values extends readonly unknown[]>(...values: Values) => values;

export const musicKeys = {
    all: queryKey('music'),
    artists: () => queryKey(...musicKeys.all, 'artists'),
    releaseLists: () => queryKey(...musicKeys.all, 'releases'),
    releaseList: (artist: MusicArtistSelection) => queryKey(...musicKeys.releaseLists(), artist),
    release: (releaseId: number) => queryKey(...musicKeys.all, 'release', releaseId),
    releaseRating: (releaseId: number, userId: number | null) =>
        queryKey(...musicKeys.release(releaseId), 'rating', {userId}),
    releaseVoters: (releaseId: number) => queryKey(...musicKeys.release(releaseId), 'voters'),
    trackRating: (trackId: number, userId: number | null) =>
        queryKey(...musicKeys.all, 'track', trackId, 'rating', {userId}),
    trackVoters: (trackId: number) => queryKey(...musicKeys.all, 'track', trackId, 'voters'),
    myRatings: (userId: number | null) => queryKey(...musicKeys.all, 'my-ratings', {userId}),
    charts: () => queryKey(...musicKeys.all, 'charts'),
    releaseChart: () => queryKey(...musicKeys.charts(), 'releases'),
    trackChart: (criterion: MusicTrackCriterion) => queryKey(...musicKeys.charts(), 'tracks', criterion),
};

export const shouldRetryMusicRequest = (failureCount: number, error: Error) => {
    if (!(error instanceof MusicApiError)) {
        return failureCount < 1;
    }
    if (error.kind !== 'network' && (!error.status || error.status < 500)) {
        return false;
    }
    return failureCount < 2;
};

export const createMusicClient = (request: MusicRequest) => {
    const get = <T>(path: string, isData: Guard<T>) => unwrap(request(path), isData);
    const mutate = (path: string, method: 'DELETE' | 'PUT', body?: unknown) =>
        unwrap(
            request(path, {
                method,
                ...(body === undefined
                    ? {}
                    : {body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}}),
            }),
            isRatingMutationResponse,
        );

    return {
        listArtists: () => get('/api/v1/music/artists', isArrayOf(isMusicArtistSummary)),
        listReleases: (artist: MusicArtistSelection) => get(releaseListPath(artist), isArrayOf(isMusicReleaseSummary)),
        getRelease: (releaseId: number) => get(`/api/v1/music/releases/${positiveId(releaseId)}`, isMusicReleaseDetail),
        getReleaseRating: (releaseId: number) =>
            get(`/api/v1/music/releases/${positiveId(releaseId)}/rating`, isMusicReleaseRatingOverview),
        setReleaseRating: (releaseId: number, value: MusicReleaseRatingValue) =>
            mutate(`/api/v1/music/releases/${positiveId(releaseId)}/rating`, 'PUT', validReleaseRating(value)),
        clearReleaseRating: (releaseId: number) =>
            mutate(`/api/v1/music/releases/${positiveId(releaseId)}/rating`, 'DELETE'),
        listReleaseVoters: (releaseId: number) =>
            get(`/api/v1/music/releases/${positiveId(releaseId)}/voters`, isArrayOf(isMusicVoterRating)),
        getTrackRating: (trackId: number) =>
            get(`/api/v1/music/tracks/${positiveId(trackId)}/rating`, isMusicTrackRatingOverview),
        setTrackRating: (trackId: number, value: MusicTrackRatingValue) =>
            mutate(`/api/v1/music/tracks/${positiveId(trackId)}/rating`, 'PUT', validTrackRating(value)),
        clearTrackRating: (trackId: number) => mutate(`/api/v1/music/tracks/${positiveId(trackId)}/rating`, 'DELETE'),
        listTrackVoters: (trackId: number) =>
            get(`/api/v1/music/tracks/${positiveId(trackId)}/voters`, isArrayOf(isMusicVoterRating)),
        listMyRatings: () => get('/api/v1/music/users/me/ratings', isArrayOf(isMusicUserRating)),
        listHighlyRatedReleases: () => get('/api/v1/music/rated/releases', isArrayOf(isMusicRatedTarget)),
        listHighlyRatedTracks: (criterion: MusicTrackCriterion) =>
            get(`/api/v1/music/rated/tracks?criterion=${criterion}`, isArrayOf(isMusicRatedTarget)),
    };
};

export type MusicClient = ReturnType<typeof createMusicClient>;

export const parseArtistSelection = (searchParams: URLSearchParams): MusicArtistSelection | null => {
    const rawGroupId = searchParams.get('groupId');
    const rawIdolId = searchParams.get('idolId');
    const groupId = optionalPositiveId(rawGroupId);
    const idolId = optionalPositiveId(rawIdolId);

    if ((rawGroupId !== null && groupId === null) || (rawIdolId !== null && idolId === null)) {
        throw new MusicApiError('Artist filters must use positive IDs.', 'validation', 400);
    }
    const count = Number(groupId !== null) + Number(idolId !== null);

    if (count === 0 && searchParams.size === 0) {
        return null;
    }
    if (count !== 1) {
        throw new MusicApiError('Exactly one artist filter is required.', 'validation', 400);
    }
    if (groupId !== null) {
        return {kind: 'group', id: groupId};
    }
    if (idolId !== null) {
        return {kind: 'idol', id: idolId};
    }
    throw new MusicApiError('Exactly one artist filter is required.', 'validation', 400);
};

export const parseTrackCriterion = (value: string | null): MusicTrackCriterion => {
    return value === 'any' ? 'any' : 'average';
};

export const releaseRatingStates = (): MusicReleaseRatingValue[] => {
    const strengths = ['weak', 'decent', 'strong'] satisfies MusicStrength[];
    const middle = Array.from({length: 9}, (_, index) => index + 1).flatMap(score =>
        strengths.map(strength => ({score, strength})),
    );
    return [{score: 0}, ...middle, {score: 10}];
};

type Guard<T> = (value: unknown) => value is T;

const unwrap = async <T>(resultPromise: Promise<ApiResult<unknown>>, isData: Guard<T>) => {
    const result = await resultPromise;
    if (result.ok) {
        if (isData(result.data)) {
            return result.data;
        }
        throw new MusicApiError('The music response was malformed.', 'application', 502);
    }
    throw new MusicApiError('The music request could not be completed.', result.kind, result.status);
};

const isArrayOf = <T>(isItem: Guard<T>): Guard<T[]> => {
    return (value: unknown): value is T[] => Array.isArray(value) && value.every(isItem);
};

const isMusicReleaseSummary = (value: unknown): value is MusicReleaseSummary => {
    return (
        isRecord(value) &&
        isPositiveId(value.id) &&
        typeof value.name === 'string' &&
        isReleaseType(value.releaseType) &&
        isOptionalString(value.releaseDate) &&
        isNonEmptyStringArray(value.artistCredits) &&
        (value.selectedCover === null || isMusicImage(value.selectedCover))
    );
};

const isMusicArtistSummary = (value: unknown): value is MusicArtistSummary => {
    return (
        isRecord(value) &&
        (value.kind === 'group' || value.kind === 'idol') &&
        isPositiveId(value.id) &&
        typeof value.name === 'string' &&
        value.name.length > 0
    );
};

const isMusicReleaseDetail = (value: unknown): value is MusicReleaseDetail => {
    return (
        isRecord(value) &&
        isMusicReleaseSummary(value.release) &&
        isArrayOf(isMusicImage)(value.images) &&
        isArrayOf(isMusicTrack)(value.tracks) &&
        isArrayOf(isMusicAssociation)(value.groups) &&
        isArrayOf(isMusicAssociation)(value.idols)
    );
};

const isMusicImage = (value: unknown): value is components['schemas']['MusicImage'] => {
    return (
        isRecord(value) &&
        isPositiveId(value.id) &&
        (value.source === 'spotify' || value.source === 'custom' || value.source === 'local') &&
        typeof value.uri === 'string' &&
        isOptionalNumber(value.width) &&
        isOptionalNumber(value.height) &&
        typeof value.preferred === 'boolean'
    );
};

const isMusicTrack = (value: unknown): value is MusicTrack => {
    return (
        isRecord(value) &&
        isPositiveId(value.id) &&
        typeof value.title === 'string' &&
        isOptionalNumber(value.discNumber) &&
        isOptionalNumber(value.trackNumber) &&
        isOptionalNumber(value.durationMs) &&
        typeof value.explicit === 'boolean' &&
        isStringArray(value.artistCredits)
    );
};

const isMusicAssociation = (value: unknown): value is components['schemas']['MusicCatalogAssociation'] => {
    return isRecord(value) && isPositiveId(value.id) && typeof value.name === 'string';
};

const isMusicReleaseRatingOverview = (value: unknown): value is MusicReleaseRatingOverview => {
    return (
        isRecord(value) &&
        isOptional(value.current, isReleaseRatingValue) &&
        isOptional(value.aggregate, isRatingAggregate) &&
        isOptional(value.nearestAggregateState, isReleaseRatingValue)
    );
};

const isMusicTrackRatingOverview = (value: unknown): value is MusicTrackRatingOverview => {
    return (
        isRecord(value) &&
        isOptional(value.current, isTrackRatingValue) &&
        isOptional(value.aggregate, isRatingAggregate)
    );
};

const isReleaseRatingValue = (value: unknown): value is MusicReleaseRatingValue => {
    return (
        isRecord(value) &&
        typeof value.score === 'number' &&
        (value.strength === undefined ||
            value.strength === null ||
            value.strength === 'weak' ||
            value.strength === 'decent' ||
            value.strength === 'strong')
    );
};

const isTrackRatingValue = (value: unknown): value is MusicTrackRatingValue => {
    return isRecord(value) && typeof value.score === 'number';
};

const isRatingAggregate = (value: unknown): value is components['schemas']['MusicRatingAggregate'] => {
    return isRecord(value) && typeof value.voterCount === 'number' && typeof value.average === 'number';
};

const isRatingMutationResponse = (value: unknown): value is RatingMutationResponse => {
    return isRecord(value) && typeof value.changed === 'boolean';
};

const isMusicVoterRating = (value: unknown): value is MusicVoterRating => {
    return (
        isRecord(value) &&
        (value.userId === undefined || value.userId === null || isPositiveId(value.userId)) &&
        typeof value.displayName === 'string' &&
        typeof value.score === 'number' &&
        isOptionalStrength(value.strength) &&
        typeof value.updatedAt === 'string'
    );
};

const isMusicUserRating = (value: unknown): value is MusicUserRating => {
    return (
        isRecord(value) &&
        (value.targetType === 'release' || value.targetType === 'track') &&
        isPositiveId(value.targetId) &&
        typeof value.targetName === 'string' &&
        typeof value.score === 'number' &&
        isOptionalStrength(value.strength) &&
        typeof value.updatedAt === 'string'
    );
};

const isMusicRatedTarget = (value: unknown): value is MusicRatedTarget => {
    return (
        isRecord(value) &&
        isPositiveId(value.id) &&
        typeof value.name === 'string' &&
        typeof value.voterCount === 'number' &&
        typeof value.average === 'number'
    );
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isPositiveId = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
};

const isReleaseType = (value: unknown): value is MusicReleaseSummary['releaseType'] => {
    return value === 'album' || value === 'ep' || value === 'single' || value === 'compilation' || value === 'other';
};

const isOptional = <T>(value: unknown, guard: Guard<T>): value is T | null | undefined => {
    return value === undefined || value === null || guard(value);
};

const isOptionalString = (value: unknown) => value === undefined || value === null || typeof value === 'string';
const isOptionalNumber = (value: unknown) => value === undefined || value === null || typeof value === 'number';
const isOptionalStrength = (value: unknown) =>
    value === undefined || value === null || value === 'weak' || value === 'decent' || value === 'strong';
const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === 'string');
const isNonEmptyStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string' && item.length > 0);

const positiveId = (value: number) => {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new MusicApiError('A positive target ID is required.', 'validation', 400);
    }
    return value;
};

const optionalPositiveId = (value: string | null) => {
    if (value === null || !/^\d+$/.test(value)) {
        return null;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const releaseListPath = (artist: MusicArtistSelection) => {
    switch (artist.kind) {
        case 'group':
            return `/api/v1/music/releases?groupId=${positiveId(artist.id)}`;
        case 'idol':
            return `/api/v1/music/releases?idolId=${positiveId(artist.id)}`;
        default: {
            const _exhaustive: never = artist;
            return _exhaustive;
        }
    }
};

const validReleaseRating = (value: MusicReleaseRatingValue): MusicReleaseRatingValue => {
    const validScore = Number.isInteger(value.score) && value.score >= 0 && value.score <= 10;
    const endpoint = value.score === 0 || value.score === 10;
    const validStrength = ['weak', 'decent', 'strong'].includes(value.strength ?? '');
    if (!validScore || (endpoint ? value.strength != null : !validStrength)) {
        throw new MusicApiError('Invalid release rating state.', 'validation', 400);
    }
    return endpoint ? {score: value.score} : {score: value.score, strength: value.strength};
};

const validTrackRating = (value: MusicTrackRatingValue): MusicTrackRatingValue => {
    if (!Number.isInteger(value.score) || value.score < 1 || value.score > 10) {
        throw new MusicApiError('Track ratings must be whole numbers from 1 to 10.', 'validation', 400);
    }
    return {score: value.score};
};
