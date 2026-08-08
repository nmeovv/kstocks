import {useEffect, useRef, type FormEvent} from 'react';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {AlertTriangle, Disc3, ExternalLink, Plus, RotateCcw, Trash2} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {MusicReleaseDraft, UploadFieldError} from '@/api/music-upload';
import {Button, buttonVariants} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import type {ReleaseUploadStatus, ReleaseUploadViewProps} from './index';
import styles from './release-upload.module.css';
import commonStyles from '../styles/index.module.css';

const RELEASE_TYPE_MESSAGES = {
    album: msg({message: 'Album', context: 'music release type'}),
    ep: msg({message: 'EP', context: 'music release type'}),
    single: msg({message: 'Single', context: 'music release type'}),
    compilation: msg({message: 'Compilation', context: 'music release type'}),
    other: msg({message: 'Other', context: 'music release type'}),
};

export const ReleaseUploadContent = ({
    desktop = false,
    draft,
    onContinueDraft,
    onDiscard,
    onDraftChange,
    onPreview,
    onStartNew,
    onUpload,
    onUrlChange,
    savedDraft,
    status,
    url,
}: ReleaseUploadViewProps & {desktop?: boolean}) => {
    return (
        <main className={cn(commonStyles.main, styles.main, desktop && styles.desktopMain)}>
            <header className={commonStyles.pageHeading}>
                <div>
                    <p className={cn('type-overline', commonStyles.eyebrow)}>
                        <Trans>Release intake</Trans>
                    </p>
                    <h1 className="type-display-lg">
                        <Trans>Add a release</Trans>
                    </h1>
                </div>
                <p className={cn('type-body-sm', commonStyles.lede)}>
                    <Trans>
                        Start with a Spotify album link, then check the details before adding it to the shelf.
                    </Trans>
                </p>
            </header>
            {savedDraft ? (
                <SavedDraftCard onContinue={onContinueDraft} onStartNew={onStartNew} savedDraft={savedDraft} />
            ) : draft ? (
                <DraftForm
                    draft={draft}
                    onDiscard={onDiscard}
                    onDraftChange={onDraftChange}
                    onUpload={onUpload}
                    status={status}
                    url={url}
                />
            ) : (
                <SpotifyStep onPreview={onPreview} onUrlChange={onUrlChange} status={status} url={url} />
            )}
        </main>
    );
};

const SavedDraftCard = ({
    onContinue,
    onStartNew,
    savedDraft,
}: {
    onContinue: () => void;
    onStartNew: () => void;
    savedDraft: NonNullable<ReleaseUploadViewProps['savedDraft']>;
}) => {
    return (
        <Card className={styles.resumeCard}>
            <CardHeader>
                <CardTitle className="type-heading-md">
                    <Trans>Continue your saved draft?</Trans>
                </CardTitle>
                <CardDescription>
                    <Trans>Your edits for {savedDraft.draft.name} are still on this device.</Trans>
                </CardDescription>
            </CardHeader>
            <CardContent className={styles.resumeActions}>
                <Button onClick={onContinue}>
                    <Trans>Continue draft</Trans>
                </Button>
                <Button variant="outline" onClick={onStartNew}>
                    <Trans>Start new</Trans>
                </Button>
            </CardContent>
        </Card>
    );
};

const SpotifyStep = ({
    onPreview,
    onUrlChange,
    status,
    url,
}: Pick<ReleaseUploadViewProps, 'onPreview' | 'onUrlChange' | 'status' | 'url'>) => {
    const {t} = useLingui();
    const pending = status.kind === 'previewing';
    return (
        <Card className={styles.spotifyCard}>
            <CardHeader>
                <CardTitle className="type-heading-md">
                    <Trans>Paste the Spotify album link</Trans>
                </CardTitle>
                <CardDescription>
                    <Trans>We’ll use Spotify to prefill the cover, credits, and track list.</Trans>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className={styles.spotifyForm}
                    onSubmit={(event: FormEvent) => {
                        event.preventDefault();
                        onPreview();
                    }}
                >
                    <label className="type-label-md" htmlFor="spotify-release-url">
                        <Trans>Spotify album URL</Trans>
                    </label>
                    <input
                        autoFocus
                        className={styles.input}
                        id="spotify-release-url"
                        inputMode="url"
                        onChange={event => onUrlChange(event.target.value)}
                        placeholder={t`https://open.spotify.com/album/...`}
                        required
                        type="url"
                        value={url}
                    />
                    <Button disabled={pending} type="submit">
                        <Disc3 aria-hidden="true" />
                        {pending ? <Trans>Fetching preview…</Trans> : <Trans>Preview release</Trans>}
                    </Button>
                </form>
                {status.kind === 'preview-error' ? <PreviewError reason={status.reason} onRetry={onPreview} /> : null}
            </CardContent>
        </Card>
    );
};

const PreviewError = ({onRetry, reason}: {onRetry: () => void; reason: 'invalid' | 'spotify' | 'error'}) => {
    return (
        <div className={styles.notice} role="alert">
            <AlertTriangle aria-hidden="true" />
            <div>
                <p className="type-label-md">
                    {reason === 'invalid' ? (
                        <Trans>Use a valid Spotify album URL.</Trans>
                    ) : reason === 'spotify' ? (
                        <Trans>Spotify is unavailable right now.</Trans>
                    ) : (
                        <Trans>The preview could not be loaded.</Trans>
                    )}
                </p>
                <Button size="sm" variant="outline" onClick={onRetry}>
                    <RotateCcw aria-hidden="true" />
                    <Trans>Retry</Trans>
                </Button>
            </div>
        </div>
    );
};

const DraftForm = ({
    draft,
    onDiscard,
    onDraftChange,
    onUpload,
    status,
    url,
}: {
    draft: MusicReleaseDraft;
    onDiscard: () => void;
    onDraftChange: (draft: MusicReleaseDraft) => void;
    onUpload: () => void;
    status: ReleaseUploadStatus;
    url: string;
}) => {
    const {i18n, t} = useLingui();
    const format = useFormatters();
    const firstInput = useRef<HTMLInputElement>(null);
    const errors = status.kind === 'validation' ? status.errors : [];

    useEffect(() => {
        if (status.kind === 'validation') {
            const path = status.errors[0]?.path ?? '';
            document.querySelector<HTMLElement>(`[data-field-path="${CSS.escape(normalizeErrorPath(path))}"]`)?.focus();
        }
    }, [status]);

    const update = <Key extends keyof MusicReleaseDraft>(key: Key, value: MusicReleaseDraft[Key]) => {
        onDraftChange({...draft, [key]: value});
    };
    const multipleDiscs = new Set(draft.tracks.map(track => track.discNumber ?? 1)).size > 1;
    const pending = status.kind === 'uploading';

    return (
        <form
            className={styles.draftLayout}
            onSubmit={(event: FormEvent) => {
                event.preventDefault();
                onUpload();
            }}
        >
            <div className={styles.sourceStrip}>
                <span className="type-meta-sm">
                    <Trans>Spotify source</Trans>
                </span>
                <a href={url} target="_blank" rel="noreferrer">
                    {url}
                    <ExternalLink aria-hidden="true" />
                </a>
            </div>
            {status.kind === 'validation' ? <ValidationSummary errors={errors} /> : null}
            {status.kind === 'duplicate' ? (
                <div className={styles.notice} role="alert">
                    <AlertTriangle aria-hidden="true" />
                    <div>
                        <p className="type-label-md">
                            <Trans>This Spotify release is already on the shelf.</Trans>
                        </p>
                        <Link
                            className={buttonVariants({size: 'sm', variant: 'outline'})}
                            to={`/music/releases/${status.releaseId}`}
                        >
                            <Trans>Open existing release</Trans>
                        </Link>
                    </div>
                </div>
            ) : null}
            {status.kind === 'auth-expired' ? (
                <p className={styles.notice} role="alert">
                    <Trans>
                        Your session expired. Log in again, then choose Add release when you’re ready. Your draft is
                        saved.
                    </Trans>
                </p>
            ) : null}
            {status.kind === 'upload-error' ? (
                <p className={styles.notice} role="alert">
                    <Trans>The release could not be added. Your draft is saved; try again.</Trans>
                </p>
            ) : null}
            <Card>
                <CardHeader>
                    <CardTitle className="type-heading-md">
                        <Trans>Release details</Trans>
                    </CardTitle>
                    <CardDescription>
                        <Trans>These values will be authoritative.</Trans>
                    </CardDescription>
                </CardHeader>
                <CardContent className={styles.fields}>
                    <Field label={t`Release name`} path="name" errors={errors}>
                        <input
                            ref={firstInput}
                            aria-invalid={hasFieldError(errors, 'name')}
                            className={styles.input}
                            data-field-path="name"
                            id="release-upload-name"
                            value={draft.name}
                            onChange={event => update('name', event.target.value)}
                        />
                    </Field>
                    <Field label={t`Release type`} path="releaseType" errors={errors}>
                        <select
                            aria-invalid={hasFieldError(errors, 'releaseType')}
                            className={styles.input}
                            data-field-path="releaseType"
                            id="release-upload-releaseType"
                            value={draft.releaseType}
                            onChange={event => update('releaseType', validReleaseType(event.target.value))}
                        >
                            {Object.entries(RELEASE_TYPE_MESSAGES).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {i18n._(label)}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label={t`Release date`} path="releaseDate" errors={errors}>
                        <input
                            aria-invalid={hasFieldError(errors, 'releaseDate')}
                            className={styles.input}
                            data-field-path="releaseDate"
                            id="release-upload-releaseDate"
                            type="date"
                            value={draft.releaseDate ?? ''}
                            onChange={event => update('releaseDate', event.target.value || null)}
                        />
                    </Field>
                    <fieldset className={styles.artistFields}>
                        <legend className="type-label-md">
                            <Trans>Release artists</Trans>
                        </legend>
                        {draft.artistCredits.map((artist, index) => (
                            <Field
                                key={index}
                                label={t`Artist ${index + 1}`}
                                path={`artistCredits.${index}`}
                                errors={errors}
                            >
                                <div className={styles.artistRow}>
                                    <input
                                        aria-invalid={hasFieldError(errors, `artistCredits.${index}`)}
                                        className={styles.input}
                                        data-field-path={`artistCredits.${index}`}
                                        id={`release-upload-artistCredits-${index}`}
                                        value={artist}
                                        onChange={event =>
                                            update(
                                                'artistCredits',
                                                draft.artistCredits.map((item, itemIndex) =>
                                                    itemIndex === index ? event.target.value : item,
                                                ),
                                            )
                                        }
                                    />
                                    <Button
                                        aria-label={t`Remove artist ${index + 1}`}
                                        disabled={draft.artistCredits.length === 1}
                                        size="icon"
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            update(
                                                'artistCredits',
                                                draft.artistCredits.filter((_, itemIndex) => itemIndex !== index),
                                            )
                                        }
                                    >
                                        <Trash2 aria-hidden="true" />
                                    </Button>
                                </div>
                            </Field>
                        ))}
                        <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => update('artistCredits', [...draft.artistCredits, ''])}
                        >
                            <Plus aria-hidden="true" />
                            <Trans>Add artist</Trans>
                        </Button>
                    </fieldset>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="type-heading-md">
                        <Trans>Spotify preview</Trans>
                    </CardTitle>
                    <CardDescription>
                        <Trans>The cover and tracks are read-only.</Trans>
                    </CardDescription>
                </CardHeader>
                <CardContent className={styles.previewGrid}>
                    {draft.image ? (
                        <img className={styles.cover} src={draft.image.uri} alt={t`Cover for ${draft.name}`} />
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            <Disc3 aria-hidden="true" />
                        </div>
                    )}
                    <section aria-label={t`Track list`} className={styles.trackSection}>
                        <ol className={styles.trackList}>
                            {draft.tracks.map((track, index) => (
                                <li
                                    key={`${track.discNumber}-${track.trackNumber}-${track.title}`}
                                    className={styles.track}
                                >
                                    <span className={styles.trackNumber}>{track.trackNumber ?? index + 1}</span>
                                    <span>
                                        <strong>{track.title}</strong>
                                        <small>
                                            {track.artistCredits.join(', ')} · {format.duration(track.durationMs ?? 0)}
                                            {track.explicit ? (
                                                <>
                                                    {' '}
                                                    · <Trans>Explicit</Trans>
                                                </>
                                            ) : null}
                                        </small>
                                    </span>
                                    {multipleDiscs ? (
                                        <span className={styles.discLabel}>
                                            <Trans>Disc {track.discNumber ?? 1}</Trans>
                                        </span>
                                    ) : null}
                                </li>
                            ))}
                        </ol>
                    </section>
                </CardContent>
                <CardFooter className={styles.formActions}>
                    <Button disabled={pending} type="submit">
                        {pending ? <Trans>Adding release…</Trans> : <Trans>Add release</Trans>}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onDiscard}>
                        <Trans>Discard draft</Trans>
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

const Field = ({
    children,
    errors,
    label,
    path,
}: {
    children: React.ReactNode;
    errors: UploadFieldError[];
    label: string;
    path: string;
}) => {
    const error = errors.find(item => normalizeErrorPath(item.path) === path);
    const fieldId = `release-upload-${path.replaceAll('.', '-')}`;
    return (
        <div className={styles.field} data-invalid={Boolean(error)}>
            <label className="type-label-md" htmlFor={fieldId}>
                {label}
            </label>
            {children}
            {error ? <span className={styles.fieldError}>{error.message}</span> : null}
        </div>
    );
};

const ValidationSummary = ({errors}: {errors: UploadFieldError[]}) => (
    <div className={styles.validationSummary} role="alert" tabIndex={-1}>
        <strong>
            <Trans>Check the highlighted fields.</Trans>
        </strong>
        <ul>
            {errors.map((error, index) => (
                <li key={`${error.path}-${index}`}>{error.message}</li>
            ))}
        </ul>
    </div>
);

const normalizeErrorPath = (path: string) =>
    path
        .replace(/^\//, '')
        .replaceAll('/', '.')
        .replace(/\[(\d+)\]/g, '.$1')
        .replace(/^draft\./, '');

const hasFieldError = (errors: UploadFieldError[], path: string) => {
    return errors.some(error => normalizeErrorPath(error.path) === path);
};

const validReleaseType = (value: string): MusicReleaseDraft['releaseType'] => {
    return value === 'ep' || value === 'single' || value === 'compilation' || value === 'other' ? value : 'album';
};
