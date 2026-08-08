import {useMemo} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {useApiTransport} from '@/api/use-api-transport';
import {useAuth} from '@/auth/auth-context';

import {
    createMusicClient,
    type MusicArtistSelection,
    type MusicReleaseRatingValue,
    type MusicTrackCriterion,
    type MusicTrackRatingValue,
    musicKeys,
    shouldRetryMusicRequest,
} from './music';

export const useMusicClient = () => {
    const {request} = useApiTransport();
    return useMemo(() => createMusicClient(request), [request]);
};

export const useMusicEnabled = () => {
    return useAuth().state.status === 'authenticated';
};

export const useMusicUserId = () => {
    const {state} = useAuth();
    return state.status === 'authenticated' ? state.user.id : null;
};

export const useArtistListQuery = () => {
    const client = useMusicClient();
    const enabled = useMusicEnabled();
    return useQuery({
        queryKey: musicKeys.artists(),
        queryFn: () => client.listArtists(),
        enabled,
        retry: shouldRetryMusicRequest,
    });
};

export const useReleaseListQuery = (artist: MusicArtistSelection | null, queryEnabled = true) => {
    const client = useMusicClient();
    const enabled = useMusicEnabled();
    return useQuery({
        queryKey: artist ? musicKeys.releaseList(artist) : musicKeys.releaseLists(),
        queryFn: () => (artist ? client.listReleases(artist) : Promise.resolve([])),
        enabled: enabled && queryEnabled && artist !== null,
        retry: shouldRetryMusicRequest,
    });
};

export const useReleaseDetailQuery = (releaseId: number) => {
    const client = useMusicClient();
    const enabled = useMusicEnabled() && releaseId > 0;
    return useQuery({
        queryKey: musicKeys.release(releaseId),
        queryFn: () => client.getRelease(releaseId),
        enabled,
        retry: shouldRetryMusicRequest,
    });
};

export const useReleaseRatingQuery = (releaseId: number) => {
    const client = useMusicClient();
    const userId = useMusicUserId();
    const enabled = userId !== null && releaseId > 0;
    return useQuery({
        queryKey: musicKeys.releaseRating(releaseId, userId),
        queryFn: () => client.getReleaseRating(releaseId),
        enabled,
        retry: shouldRetryMusicRequest,
    });
};

export const useTrackRatingQuery = (trackId: number) => {
    const client = useMusicClient();
    const userId = useMusicUserId();
    const enabled = userId !== null && trackId > 0;
    return useQuery({
        queryKey: musicKeys.trackRating(trackId, userId),
        queryFn: () => client.getTrackRating(trackId),
        enabled,
        retry: shouldRetryMusicRequest,
    });
};

export const useReleaseRatingMutations = (releaseId: number) => {
    const client = useMusicClient();
    const queryClient = useQueryClient();
    const userId = useMusicUserId();
    const invalidate = async () => {
        await Promise.all([
            queryClient.invalidateQueries({queryKey: musicKeys.releaseRating(releaseId, userId)}),
            queryClient.invalidateQueries({queryKey: musicKeys.releaseVoters(releaseId)}),
            queryClient.invalidateQueries({queryKey: musicKeys.myRatings(userId)}),
            queryClient.invalidateQueries({queryKey: musicKeys.releaseChart()}),
        ]);
    };
    return {
        set: useMutation({
            mutationFn: (value: MusicReleaseRatingValue) => client.setReleaseRating(releaseId, value),
            onSuccess: invalidate,
        }),
        clear: useMutation({mutationFn: () => client.clearReleaseRating(releaseId), onSuccess: invalidate}),
    };
};

export const useTrackRatingMutations = (trackId: number) => {
    const client = useMusicClient();
    const queryClient = useQueryClient();
    const userId = useMusicUserId();
    const invalidate = async () => {
        await Promise.all([
            queryClient.invalidateQueries({queryKey: musicKeys.trackRating(trackId, userId)}),
            queryClient.invalidateQueries({queryKey: musicKeys.trackVoters(trackId)}),
            queryClient.invalidateQueries({queryKey: musicKeys.myRatings(userId)}),
            queryClient.invalidateQueries({queryKey: musicKeys.trackChart('average')}),
            queryClient.invalidateQueries({queryKey: musicKeys.trackChart('any')}),
        ]);
    };
    return {
        set: useMutation({
            mutationFn: (value: MusicTrackRatingValue) => client.setTrackRating(trackId, value),
            onSuccess: invalidate,
        }),
        clear: useMutation({mutationFn: () => client.clearTrackRating(trackId), onSuccess: invalidate}),
    };
};

export const useVotersQuery = (target: {type: 'release' | 'track'; id: number}, enabled: boolean) => {
    const client = useMusicClient();
    const authenticated = useMusicEnabled();
    return useQuery({
        queryKey: target.type === 'release' ? musicKeys.releaseVoters(target.id) : musicKeys.trackVoters(target.id),
        queryFn: () =>
            target.type === 'release' ? client.listReleaseVoters(target.id) : client.listTrackVoters(target.id),
        enabled: enabled && authenticated,
        retry: shouldRetryMusicRequest,
    });
};

export const useMyRatingsQuery = () => {
    const client = useMusicClient();
    const userId = useMusicUserId();
    return useQuery({
        queryKey: musicKeys.myRatings(userId),
        queryFn: client.listMyRatings,
        enabled: userId !== null,
        retry: shouldRetryMusicRequest,
    });
};

export const useChartsQueries = (criterion: MusicTrackCriterion) => {
    const client = useMusicClient();
    const enabled = useMusicEnabled();
    return {
        releases: useQuery({
            queryKey: musicKeys.releaseChart(),
            queryFn: client.listHighlyRatedReleases,
            enabled,
            retry: shouldRetryMusicRequest,
        }),
        tracks: useQuery({
            queryKey: musicKeys.trackChart(criterion),
            queryFn: () => client.listHighlyRatedTracks(criterion),
            enabled,
            retry: shouldRetryMusicRequest,
        }),
    };
};
