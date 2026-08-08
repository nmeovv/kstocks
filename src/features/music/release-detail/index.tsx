import type {ComponentType} from 'react';
import {useParams} from 'react-router-dom';

import type {MusicReleaseDetail} from '@/api/music';
import {useReleaseDetailQuery} from '@/api/use-music';
import {MusicAuthGate, type MusicPlatform, MusicShell} from '@/features/music/music-shell';

export type MusicReleaseDetailViewProps = {
    detail?: MusicReleaseDetail;
    onRetry: () => void;
    releaseId: number;
    status: 'error' | 'loading' | 'ready';
};

type MusicReleaseDetailProps = {
    platform: MusicPlatform;
    view: ComponentType<MusicReleaseDetailViewProps>;
};

export const MusicReleaseDetailPage = ({platform, view: View}: MusicReleaseDetailProps) => {
    const params = useParams();
    const releaseId = parsePositiveId(params.releaseId);
    const query = useReleaseDetailQuery(releaseId);
    const status = releaseId < 1 || query.isError ? 'error' : query.isPending ? 'loading' : 'ready';

    return (
        <MusicShell platform={platform}>
            <MusicAuthGate>
                <View detail={query.data} onRetry={() => void query.refetch()} releaseId={releaseId} status={status} />
            </MusicAuthGate>
        </MusicShell>
    );
};

export const parsePositiveId = (value?: string) => {
    if (!value || !/^\d+$/.test(value)) {
        return -1;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : -1;
};
