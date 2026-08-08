import {expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';

import type {components} from '@/api/generated/schema';
import {ReleaseUploadContent} from '@/features/music/release-upload/release-upload-content';
import {AppI18nProvider} from '@/i18n';

const draft = {
    name: 'Armageddon',
    releaseType: 'album',
    releaseDate: '2024-05-27',
    artistCredits: ['aespa'],
    image: {source: 'spotify', uri: 'https://images.example/cover.jpg', width: 300, height: 300},
    tracks: [
        {
            title: 'Supernova',
            discNumber: 1,
            trackNumber: 1,
            durationMs: 178880,
            explicit: false,
            artistCredits: ['aespa'],
        },
        {
            title: 'Armageddon',
            discNumber: 2,
            trackNumber: 1,
            durationMs: 196720,
            explicit: true,
            artistCredits: ['aespa'],
        },
    ],
} satisfies components['schemas']['MusicReleaseDraft'];

it('shows validation summary and focuses the first invalid field', async () => {
    renderDraft({
        kind: 'validation',
        errors: [{path: 'name', code: 'required', message: 'Name is required.'}],
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Check the highlighted fields.');
    await waitFor(() => expect(screen.getByRole('textbox', {name: /Release name/})).toHaveFocus());
    expect(screen.getAllByText('Name is required.')).toHaveLength(2);
});

it('links to the existing release after a duplicate response', () => {
    renderDraft({kind: 'duplicate', releaseId: 101});
    expect(screen.getByRole('link', {name: 'Open existing release'})).toHaveAttribute('href', '/music/releases/101');
});

it('shows disc labels only when the preview spans multiple discs', () => {
    const {rerender} = renderDraft({kind: 'idle'});
    expect(screen.getAllByText(/Disc [12]/)).toHaveLength(2);

    rerender(
        wrap(<ReleaseUploadContent {...props} draft={{...draft, tracks: [draft.tracks[0]]}} status={{kind: 'idle'}} />),
    );
    expect(screen.queryByText(/Disc 1/)).not.toBeInTheDocument();
});

it('offers to continue or replace a restored draft', async () => {
    const user = userEvent.setup();
    const onContinueDraft = vi.fn();
    const onStartNew = vi.fn();
    render(
        wrap(
            <ReleaseUploadContent
                {...props}
                draft={null}
                onContinueDraft={onContinueDraft}
                onStartNew={onStartNew}
                savedDraft={{url: props.url, draft}}
                status={{kind: 'idle'}}
            />,
        ),
    );

    await user.click(screen.getByRole('button', {name: 'Continue draft'}));
    await user.click(screen.getByRole('button', {name: 'Start new'}));
    expect(onContinueDraft).toHaveBeenCalledOnce();
    expect(onStartNew).toHaveBeenCalledOnce();
});

it('explains Spotify preview failures and retries', async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    render(
        wrap(
            <ReleaseUploadContent
                {...props}
                draft={null}
                onPreview={onPreview}
                status={{kind: 'preview-error', reason: 'spotify'}}
            />,
        ),
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Spotify is unavailable right now.');
    await user.click(screen.getByRole('button', {name: 'Retry'}));
    expect(onPreview).toHaveBeenCalledOnce();
});

const props = {
    draft,
    onContinueDraft: vi.fn(),
    onDiscard: vi.fn(),
    onDraftChange: vi.fn(),
    onPreview: vi.fn(),
    onStartNew: vi.fn(),
    onUpload: vi.fn(),
    onUrlChange: vi.fn(),
    savedDraft: null,
    url: 'https://open.spotify.com/album/1234567890123456789012',
};

const renderDraft = (status: React.ComponentProps<typeof ReleaseUploadContent>['status']) => {
    return render(wrap(<ReleaseUploadContent {...props} status={status} />));
};

const wrap = (children: React.ReactNode) => (
    <AppI18nProvider>
        <MemoryRouter>{children}</MemoryRouter>
    </AppI18nProvider>
);
