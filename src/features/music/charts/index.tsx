import type {ComponentType} from 'react';
import {useSearchParams} from 'react-router-dom';

import {type MusicRatedTarget, type MusicTrackCriterion, parseTrackCriterion} from '@/api/music';
import {useChartsQueries} from '@/api/use-music';
import {MusicAuthGate, type MusicPlatform, MusicShell} from '@/features/music/music-shell';

export type MusicChartsViewProps = {
    criterion: MusicTrackCriterion;
    onRetry: () => void;
    releases?: MusicRatedTarget[];
    status: 'error' | 'loading' | 'ready';
    tracks?: MusicRatedTarget[];
};

export const MusicChartsPage = ({
    platform,
    view: View,
}: {
    platform: MusicPlatform;
    view: ComponentType<MusicChartsViewProps>;
}) => {
    const [searchParams] = useSearchParams();
    const criterion = parseTrackCriterion(searchParams.get('criterion'));
    const queries = useChartsQueries(criterion);
    const status =
        queries.releases.isError || queries.tracks.isError
            ? 'error'
            : queries.releases.isPending || queries.tracks.isPending
              ? 'loading'
              : 'ready';
    return (
        <MusicShell platform={platform}>
            <MusicAuthGate>
                <View
                    criterion={criterion}
                    onRetry={() => {
                        void queries.releases.refetch();
                        void queries.tracks.refetch();
                    }}
                    releases={queries.releases.data}
                    status={status}
                    tracks={queries.tracks.data}
                />
            </MusicAuthGate>
        </MusicShell>
    );
};
