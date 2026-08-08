import type {ComponentType} from 'react';

import type {MusicUserRating} from '@/api/music';
import {useMyRatingsQuery} from '@/api/use-music';
import {MusicAuthGate, type MusicPlatform, MusicShell} from '@/features/music/music-shell';

export type MusicMyRatingsViewProps = {
    onRetry: () => void;
    ratings?: MusicUserRating[];
    status: 'empty' | 'error' | 'loading' | 'populated';
};

export const MusicMyRatingsPage = ({
    platform,
    view: View,
}: {
    platform: MusicPlatform;
    view: ComponentType<MusicMyRatingsViewProps>;
}) => {
    const query = useMyRatingsQuery();
    const status = query.isError ? 'error' : query.isPending ? 'loading' : query.data?.length ? 'populated' : 'empty';
    return (
        <MusicShell platform={platform}>
            <MusicAuthGate>
                <View onRetry={() => void query.refetch()} ratings={query.data} status={status} />
            </MusicAuthGate>
        </MusicShell>
    );
};
