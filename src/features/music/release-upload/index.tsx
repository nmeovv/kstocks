import {useEffect, useState, type ComponentType} from 'react';
import {useLingui} from '@lingui/react/macro';
import {useNavigate} from 'react-router-dom';

import {
    isSpotifyAlbumUrl,
    previewSpotifyRelease,
    uploadMusicRelease,
    type MusicReleaseDraft,
    type UploadFieldError,
} from '@/api/music-upload';
import {useApiTransport} from '@/api/use-api-transport';
import {useAuth} from '@/auth/auth-context';
import {MusicAuthGate, type MusicPlatform, MusicShell} from '@/features/music/music-shell';

import {
    clearReleaseUploadDraft,
    isMusicReleaseDraft,
    loadReleaseUploadDraft,
    saveReleaseUploadDraft,
    type SavedReleaseUploadDraft,
} from './draft-storage';

export type ReleaseUploadStatus =
    | {kind: 'idle'}
    | {kind: 'previewing'}
    | {kind: 'preview-error'; reason: 'invalid' | 'spotify' | 'error'}
    | {kind: 'uploading'}
    | {kind: 'validation'; errors: UploadFieldError[]}
    | {kind: 'duplicate'; releaseId: number}
    | {kind: 'auth-expired'}
    | {kind: 'upload-error'};

export type ReleaseUploadViewProps = {
    savedDraft: SavedReleaseUploadDraft | null;
    url: string;
    draft: MusicReleaseDraft | null;
    status: ReleaseUploadStatus;
    onUrlChange: (url: string) => void;
    onPreview: () => void;
    onContinueDraft: () => void;
    onStartNew: () => void;
    onDiscard: () => void;
    onDraftChange: (draft: MusicReleaseDraft) => void;
    onUpload: () => void;
};

type ReleaseUploadPageProps = {
    platform: MusicPlatform;
    view: ComponentType<ReleaseUploadViewProps>;
};

export const MusicReleaseUploadPage = ({platform, view: View}: ReleaseUploadPageProps) => {
    const {t} = useLingui();
    const navigate = useNavigate();
    const {request} = useApiTransport();
    const {showLogin} = useAuth();
    const [savedDraft, setSavedDraft] = useState(loadReleaseUploadDraft);
    const [url, setUrl] = useState('');
    const [draft, setDraft] = useState<MusicReleaseDraft | null>(null);
    const [status, setStatus] = useState<ReleaseUploadStatus>({kind: 'idle'});

    useEffect(() => {
        if (draft) {
            saveReleaseUploadDraft({url, draft});
        }
    }, [draft, url]);

    const preview = async () => {
        if (!isSpotifyAlbumUrl(url.trim())) {
            setStatus({kind: 'preview-error', reason: 'invalid'});
            return;
        }
        setStatus({kind: 'previewing'});
        const result = await previewSpotifyRelease({request, body: {url: url.trim()}, isDraft: isMusicReleaseDraft});
        if (result.ok) {
            setDraft(result.data);
            setSavedDraft(null);
            setStatus({kind: 'idle'});
            return;
        }
        const reason = previewFailureReason(result.failure);
        setStatus({kind: 'preview-error', reason});
    };

    const upload = async () => {
        if (!draft) {
            return;
        }
        setStatus({kind: 'uploading'});
        const result = await uploadMusicRelease({request, draft});
        if (result.ok) {
            clearReleaseUploadDraft();
            navigate(`/music/releases/${result.data.releaseId}`);
            return;
        }
        switch (result.failure.kind) {
            case 'validation':
                setStatus({kind: 'validation', errors: result.failure.errors});
                return;
            case 'duplicate':
                setStatus({kind: 'duplicate', releaseId: result.failure.duplicate.releaseId});
                return;
            case 'unauthenticated':
                setStatus({kind: 'auth-expired'});
                showLogin();
                return;
            case 'error':
                setStatus({kind: 'upload-error'});
                return;
            default: {
                const _exhaustive: never = result.failure;
                return _exhaustive;
            }
        }
    };

    const startNew = () => {
        if (!window.confirm(t`Start a new upload and discard the saved draft?`)) {
            return;
        }
        clearReleaseUploadDraft();
        setSavedDraft(null);
        setDraft(null);
        setUrl('');
        setStatus({kind: 'idle'});
    };

    const discard = () => {
        if (!window.confirm(t`Discard this upload draft?`)) {
            return;
        }
        clearReleaseUploadDraft();
        navigate('/music/releases');
    };

    return (
        <MusicShell platform={platform}>
            <MusicAuthGate>
                <View
                    draft={draft}
                    onContinueDraft={() => {
                        if (!savedDraft) {
                            return;
                        }
                        setUrl(savedDraft.url);
                        setDraft(savedDraft.draft);
                        setSavedDraft(null);
                    }}
                    onDiscard={discard}
                    onDraftChange={nextDraft => {
                        setDraft(nextDraft);
                        setStatus({kind: 'idle'});
                    }}
                    onPreview={() => void preview()}
                    onStartNew={startNew}
                    onUpload={() => void upload()}
                    onUrlChange={nextUrl => {
                        setUrl(nextUrl);
                        setStatus({kind: 'idle'});
                    }}
                    savedDraft={savedDraft}
                    status={status}
                    url={url}
                />
            </MusicAuthGate>
        </MusicShell>
    );
};

const previewFailureReason = (
    failure: Exclude<Awaited<ReturnType<typeof previewSpotifyRelease>>, {ok: true}>['failure'],
): Extract<ReleaseUploadStatus, {kind: 'preview-error'}>['reason'] => {
    switch (failure.kind) {
        case 'invalid-spotify-url':
            return 'invalid';
        case 'spotify-unavailable':
            return 'spotify';
        case 'unauthenticated':
        case 'error':
            return 'error';
        default: {
            const _exhaustive: never = failure;
            return _exhaustive;
        }
    }
};
