import {useEffect, useState} from 'react';
import {msg} from '@lingui/core/macro';
import {Plural, Trans, useLingui} from '@lingui/react/macro';
import {RotateCcw, Star, Users} from 'lucide-react';

import {
    type MusicReleaseRatingOverview,
    type MusicReleaseRatingValue,
    type MusicStrength,
    type MusicTrackRatingOverview,
    type MusicVoterRating,
    releaseRatingStates,
} from '@/api/music';
import {
    useReleaseRatingMutations,
    useReleaseRatingQuery,
    useTrackRatingMutations,
    useTrackRatingQuery,
    useVotersQuery,
} from '@/api/use-music';
import {Button} from '@/components/ui/button';
import {
    PopupActions,
    PopupBody,
    PopupContent,
    PopupDescription,
    PopupEyebrow,
    PopupFooter,
    PopupFooterNote,
    PopupHeader,
    PopupRoot,
    PopupTitle,
    PopupTrigger,
} from '@/components/ui/popup';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import styles from './rating-controls.module.css';

const STRENGTH_MESSAGES = {
    weak: msg({message: 'Weak', context: 'release rating strength'}),
    decent: msg({message: 'Decent', context: 'release rating strength'}),
    strong: msg({message: 'Strong', context: 'release rating strength'}),
} satisfies Record<MusicStrength, ReturnType<typeof msg>>;

const RELEASE_STATES = releaseRatingStates();

export const ReleaseRatingControl = ({releaseId, releaseName}: {releaseId: number; releaseName: string}) => {
    const query = useReleaseRatingQuery(releaseId);
    const mutations = useReleaseRatingMutations(releaseId);

    return (
        <ReleaseRatingView
            error={mutations.set.isError || mutations.clear.isError}
            loadError={query.isError && query.data === undefined}
            loading={query.isPending}
            onClear={() => mutations.clear.mutateAsync()}
            onRetry={() => {
                if (mutations.set.isError && mutations.set.variables) {
                    mutations.set.mutate(mutations.set.variables);
                } else if (mutations.clear.isError) {
                    mutations.clear.mutate();
                } else {
                    void query.refetch();
                }
            }}
            onSave={value => mutations.set.mutateAsync(value)}
            overview={query.data}
            releaseId={releaseId}
            releaseName={releaseName}
            saving={mutations.set.isPending || mutations.clear.isPending}
        />
    );
};

export const ReleaseRatingView = ({
    error,
    loadError = false,
    loading,
    onClear,
    onRetry,
    onSave,
    overview,
    releaseId,
    releaseName,
    saving,
    votersControl,
}: {
    error: boolean;
    loadError?: boolean;
    loading: boolean;
    onClear: () => Promise<unknown>;
    onRetry: () => void;
    onSave: (value: MusicReleaseRatingValue) => Promise<unknown>;
    overview?: MusicReleaseRatingOverview;
    releaseId: number;
    releaseName: string;
    saving: boolean;
    votersControl?: React.ReactNode;
}) => {
    const {i18n, t} = useLingui();
    const format = useFormatters();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<MusicReleaseRatingValue>(overview?.current ?? {score: 0});

    useEffect(() => {
        if (!open) {
            setDraft(overview?.current ?? {score: 0});
        }
    }, [open, overview?.current]);

    if (loading) {
        return <RatingSkeleton />;
    }
    if (loadError) {
        return <RatingLoadError onRetry={onRetry} />;
    }

    const currentLabel = overview?.current
        ? releaseValueLabel(overview.current, i18n._.bind(i18n), format.integer)
        : t`Unrated`;
    const aggregate = overview?.aggregate;

    return (
        <div className={styles.ratingSurface}>
            <div className={styles.ratingReadout}>
                <span className="type-overline">
                    <Trans>Your release rating</Trans>
                </span>
                <strong className={cn('type-display-md', styles.currentValue)}>{currentLabel}</strong>
                {aggregate ? (
                    <span className="type-meta-sm">
                        <Trans>
                            Community {format.score(aggregate.average)} ·{' '}
                            <Plural value={aggregate.voterCount} one="# vote" other="# votes" />
                        </Trans>
                    </span>
                ) : (
                    <span className="type-meta-sm">
                        <Trans>No community ratings yet</Trans>
                    </span>
                )}
            </div>
            <div className={styles.ratingActions}>
                <PopupRoot open={open} onOpenChange={setOpen}>
                    <PopupTrigger>
                        <Button aria-label={t`Rate ${releaseName}`}>
                            <Star aria-hidden="true" />
                            {overview?.current ? <Trans>Change rating</Trans> : <Trans>Rate release</Trans>}
                        </Button>
                    </PopupTrigger>
                    <PopupContent className={styles.ratingPopup}>
                        <PopupHeader>
                            <PopupEyebrow>
                                <Trans>29-point release scale</Trans>
                            </PopupEyebrow>
                            <PopupTitle>
                                <Trans>Rate {releaseName}</Trans>
                            </PopupTitle>
                            <PopupDescription>
                                <Trans>Use weak, decent, or strong to place scores between whole numbers.</Trans>
                            </PopupDescription>
                        </PopupHeader>
                        <PopupBody>
                            <fieldset className={styles.releaseScale} disabled={saving}>
                                <legend className="type-label-md">
                                    <Trans>Choose a release rating</Trans>
                                </legend>
                                <div className={styles.releaseStates}>
                                    {RELEASE_STATES.map(value => {
                                        const id = releaseStateId(value);
                                        const checked = sameReleaseRating(draft, value);
                                        const label = releaseValueLabel(value, i18n._.bind(i18n), format.integer);
                                        return (
                                            <label className={styles.releaseState} data-checked={checked} key={id}>
                                                <input
                                                    checked={checked}
                                                    name={`release-rating-${releaseId}`}
                                                    onChange={() => setDraft(value)}
                                                    type="radio"
                                                    value={id}
                                                />
                                                <span aria-hidden="true">
                                                    {releaseStateMark(value, format.integer)}
                                                </span>
                                                <span className={styles.srOnly}>{label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div className={styles.scaleLegend}>
                                    <span>
                                        − <Trans>weak</Trans>
                                    </span>
                                    <span>
                                        • <Trans>decent</Trans>
                                    </span>
                                    <span>
                                        + <Trans>strong</Trans>
                                    </span>
                                </div>
                            </fieldset>
                            <div aria-live="polite" className={styles.draftReadout}>
                                <span className="type-overline">
                                    <Trans>Selected</Trans>
                                </span>
                                <strong className="type-heading-lg">
                                    {releaseValueLabel(draft, i18n._.bind(i18n), format.integer)}
                                </strong>
                            </div>
                            {error ? <MutationError onRetry={onRetry} /> : null}
                        </PopupBody>
                        <PopupFooter className={styles.popupFooter}>
                            {overview?.current ? (
                                <Button
                                    disabled={saving}
                                    variant="ghost"
                                    onClick={async () => {
                                        try {
                                            await onClear();
                                            setOpen(false);
                                        } catch {
                                            // Mutation state renders the actionable error in this popup.
                                        }
                                    }}
                                >
                                    <RotateCcw aria-hidden="true" />
                                    <Trans>Clear rating</Trans>
                                </Button>
                            ) : null}
                            <Button
                                disabled={saving || sameReleaseRating(draft, overview?.current)}
                                onClick={async () => {
                                    try {
                                        await onSave(draft);
                                        setOpen(false);
                                    } catch {
                                        // Mutation state renders the actionable error in this popup.
                                    }
                                }}
                            >
                                {saving ? <Trans>Saving…</Trans> : <Trans>Save rating</Trans>}
                            </Button>
                        </PopupFooter>
                        <PopupFooterNote>
                            <Trans>You can change or clear this rating at any time.</Trans>
                        </PopupFooterNote>
                    </PopupContent>
                </PopupRoot>
                {votersControl === undefined ? (
                    <VotersPopup
                        count={aggregate?.voterCount ?? 0}
                        target={{type: 'release', id: releaseId, name: releaseName}}
                    />
                ) : (
                    votersControl
                )}
            </div>
        </div>
    );
};

export const TrackRatingControl = ({trackId, trackName}: {trackId: number; trackName: string}) => {
    const query = useTrackRatingQuery(trackId);
    const mutations = useTrackRatingMutations(trackId);
    return (
        <TrackRatingView
            error={mutations.set.isError || mutations.clear.isError}
            loadError={query.isError && query.data === undefined}
            loading={query.isPending}
            onClear={() => mutations.clear.mutateAsync()}
            onRetry={() => {
                if (mutations.set.isError && mutations.set.variables) {
                    mutations.set.mutate(mutations.set.variables);
                } else if (mutations.clear.isError) {
                    mutations.clear.mutate();
                } else {
                    void query.refetch();
                }
            }}
            onSave={score => mutations.set.mutateAsync({score})}
            overview={query.data}
            saving={mutations.set.isPending || mutations.clear.isPending}
            trackId={trackId}
            trackName={trackName}
        />
    );
};

export const TrackRatingView = ({
    error,
    loadError = false,
    loading,
    onClear,
    onRetry,
    onSave,
    overview,
    saving,
    trackId,
    trackName,
    votersControl,
}: {
    error: boolean;
    loadError?: boolean;
    loading: boolean;
    onClear: () => Promise<unknown>;
    onRetry: () => void;
    onSave: (score: number) => Promise<unknown>;
    overview?: MusicTrackRatingOverview;
    saving: boolean;
    trackId: number;
    trackName: string;
    votersControl?: React.ReactNode;
}) => {
    const {t} = useLingui();
    const format = useFormatters();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(overview?.current?.score ?? 7);

    useEffect(() => {
        if (!open) {
            setDraft(overview?.current?.score ?? 7);
        }
    }, [open, overview?.current?.score]);

    if (loading) {
        return <span aria-label={t`Loading track rating`} className={styles.trackSkeleton} />;
    }
    if (loadError) {
        return <RatingLoadError onRetry={onRetry} />;
    }

    return (
        <div className={styles.trackRating}>
            <div className={styles.trackScores}>
                <span className="type-label-md">
                    {overview?.current ? format.integer(overview.current.score) : <Trans>Rate</Trans>}
                </span>
                {overview?.aggregate ? (
                    <span className="type-meta-sm">
                        <Trans>Avg {format.score(overview.aggregate.average)}</Trans>
                    </span>
                ) : null}
            </div>
            <PopupRoot open={open} onOpenChange={setOpen}>
                <PopupTrigger>
                    <Button size="sm" variant="outline" aria-label={t`Rate ${trackName}`}>
                        <Star aria-hidden="true" />
                        <Trans>Rate</Trans>
                    </Button>
                </PopupTrigger>
                <PopupContent className={styles.trackPopup}>
                    <PopupHeader>
                        <PopupEyebrow>
                            <Trans>Track rating</Trans>
                        </PopupEyebrow>
                        <PopupTitle>
                            <Trans>Rate {trackName}</Trans>
                        </PopupTitle>
                        <PopupDescription>
                            <Trans>Choose a whole-number score from 1 to 10.</Trans>
                        </PopupDescription>
                    </PopupHeader>
                    <PopupBody>
                        <fieldset className={styles.trackScale} disabled={saving}>
                            <legend className={styles.srOnly}>
                                <Trans>Choose a track rating</Trans>
                            </legend>
                            {Array.from({length: 10}, (_, index) => index + 1).map(score => (
                                <label className={styles.trackState} data-checked={draft === score} key={score}>
                                    <input
                                        checked={draft === score}
                                        name={`track-rating-${trackId}`}
                                        onChange={() => setDraft(score)}
                                        type="radio"
                                    />
                                    <span>{format.integer(score)}</span>
                                </label>
                            ))}
                        </fieldset>
                        {error ? <MutationError onRetry={onRetry} /> : null}
                    </PopupBody>
                    <PopupActions>
                        {overview?.current ? (
                            <Button
                                disabled={saving}
                                variant="ghost"
                                onClick={async () => {
                                    try {
                                        await onClear();
                                        setOpen(false);
                                    } catch {
                                        // Mutation state renders the actionable error in this popup.
                                    }
                                }}
                            >
                                <Trans>Clear rating</Trans>
                            </Button>
                        ) : null}
                        <Button
                            disabled={saving || draft === overview?.current?.score}
                            onClick={async () => {
                                try {
                                    await onSave(draft);
                                    setOpen(false);
                                } catch {
                                    // Mutation state renders the actionable error in this popup.
                                }
                            }}
                        >
                            {saving ? <Trans>Saving…</Trans> : <Trans>Save rating</Trans>}
                        </Button>
                    </PopupActions>
                    <PopupFooterNote>
                        <Trans>Track ratings use whole numbers only.</Trans>
                    </PopupFooterNote>
                </PopupContent>
            </PopupRoot>
            {votersControl === undefined ? (
                <VotersPopup
                    count={overview?.aggregate?.voterCount ?? 0}
                    target={{type: 'track', id: trackId, name: trackName}}
                />
            ) : (
                votersControl
            )}
        </div>
    );
};

export const MusicVoterList = ({voters}: {voters: MusicVoterRating[]}) => {
    const {i18n} = useLingui();
    const format = useFormatters();
    return (
        <ol className={styles.voterList}>
            {voters.map((voter, index) => (
                <li key={`${voter.userId ?? 'deleted'}-${voter.updatedAt}-${index}`}>
                    <span className="type-label-md">{voter.displayName}</span>
                    <strong className="type-heading-sm">
                        {voter.strength
                            ? releaseValueLabel(voter, i18n._.bind(i18n), format.integer)
                            : format.integer(voter.score)}
                    </strong>
                </li>
            ))}
        </ol>
    );
};

const VotersPopup = ({
    count,
    target,
}: {
    count: number;
    target: {type: 'release' | 'track'; id: number; name: string};
}) => {
    const [open, setOpen] = useState(false);
    const query = useVotersQuery(target, open);
    return (
        <PopupRoot open={open} onOpenChange={setOpen}>
            <PopupTrigger>
                <Button size="sm" variant="ghost">
                    <Users aria-hidden="true" />
                    <Plural value={count} one="# voter" other="# voters" />
                </Button>
            </PopupTrigger>
            <PopupContent className={styles.votersPopup}>
                <PopupHeader>
                    <PopupEyebrow>
                        <Trans>Community breakdown</Trans>
                    </PopupEyebrow>
                    <PopupTitle>
                        <Trans>Ratings for {target.name}</Trans>
                    </PopupTitle>
                    <PopupDescription>
                        <Trans>Current votes, most recently updated first.</Trans>
                    </PopupDescription>
                </PopupHeader>
                <PopupBody>
                    {query.isPending ? <RatingSkeleton /> : null}
                    {query.isError ? <VotersError onRetry={() => void query.refetch()} /> : null}
                    {query.data?.length === 0 ? (
                        <p className="type-body-sm">
                            <Trans>No one has rated this yet.</Trans>
                        </p>
                    ) : null}
                    {query.data?.length ? <MusicVoterList voters={query.data} /> : null}
                </PopupBody>
            </PopupContent>
        </PopupRoot>
    );
};

const MutationError = ({onRetry}: {onRetry: () => void}) => {
    return (
        <div className={styles.error} role="alert">
            <p className="type-body-sm">
                <Trans>The rating could not be saved. Try again.</Trans>
            </p>
            <Button size="sm" variant="outline" onClick={onRetry}>
                <Trans>Retry</Trans>
            </Button>
        </div>
    );
};

const RatingLoadError = ({onRetry}: {onRetry: () => void}) => {
    return (
        <div className={styles.error} role="alert">
            <p className="type-body-sm">
                <Trans>The rating could not be loaded.</Trans>
            </p>
            <Button size="sm" variant="outline" onClick={onRetry}>
                <Trans>Retry</Trans>
            </Button>
        </div>
    );
};

const VotersError = ({onRetry}: {onRetry: () => void}) => {
    return (
        <div className={styles.error} role="alert">
            <p className="type-body-sm">
                <Trans>The voter breakdown could not be loaded.</Trans>
            </p>
            <Button size="sm" variant="outline" onClick={onRetry}>
                <Trans>Retry</Trans>
            </Button>
        </div>
    );
};

const RatingSkeleton = () => {
    return (
        <div aria-busy="true" className={styles.ratingSkeleton}>
            <span />
            <span />
        </div>
    );
};

const releaseValueLabel = (
    value: MusicReleaseRatingValue,
    translate: (descriptor: (typeof STRENGTH_MESSAGES)[MusicStrength]) => string,
    integer: (value: number) => string,
) => {
    if (!value.strength) {
        return integer(value.score);
    }
    return `${translate(STRENGTH_MESSAGES[value.strength])} ${integer(value.score)}`;
};

const releaseStateMark = (value: MusicReleaseRatingValue, integer: (value: number) => string) => {
    const suffix = value.strength === 'weak' ? '−' : value.strength === 'strong' ? '+' : '';
    return `${integer(value.score)}${suffix}`;
};

const releaseStateId = (value: MusicReleaseRatingValue) => `${value.score}-${value.strength ?? 'exact'}`;

const sameReleaseRating = (left?: MusicReleaseRatingValue | null, right?: MusicReleaseRatingValue | null) => {
    return left?.score === right?.score && (left?.strength ?? null) === (right?.strength ?? null);
};
