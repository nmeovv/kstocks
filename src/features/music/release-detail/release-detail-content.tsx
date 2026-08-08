import {msg} from '@lingui/core/macro';
import {Plural, Trans, useLingui} from '@lingui/react/macro';
import {ArrowLeft, Disc3} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {MusicReleaseDetail, MusicTrack} from '@/api/music';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import type {MusicReleaseDetailViewProps} from './index';
import styles from './release-detail.module.css';
import {ReleaseRatingControl, TrackRatingControl} from '../rating-controls';
import commonStyles from '../styles/index.module.css';

const RELEASE_TYPE_MESSAGES = {
    album: msg({message: 'Album', context: 'music release type'}),
    ep: msg({message: 'EP', context: 'music release type'}),
    single: msg({message: 'Single', context: 'music release type'}),
    compilation: msg({message: 'Compilation', context: 'music release type'}),
    other: msg({message: 'Other', context: 'music release type'}),
};

export const MusicReleaseDetailContent = ({
    desktop = false,
    detail,
    onRetry,
    releaseId,
    releaseRating,
    status,
    trackRating,
}: MusicReleaseDetailViewProps & {
    desktop?: boolean;
    releaseRating?: React.ReactNode;
    trackRating?: (track: MusicTrack) => React.ReactNode;
}) => {
    if (status === 'loading') {
        return (
            <main className={commonStyles.main}>
                <DetailSkeleton />
            </main>
        );
    }
    if (status === 'error' || !detail) {
        return (
            <main className={commonStyles.main}>
                <section className={commonStyles.statePanel} data-tone="error" role="alert">
                    <h1 className="type-heading-lg">
                        <Trans>This release could not be found.</Trans>
                    </h1>
                    <p className="type-body-sm">
                        <Trans>It may have been removed, or the release link may be incomplete.</Trans>
                    </p>
                    <div className={styles.errorActions}>
                        <Button onClick={onRetry}>
                            <Trans>Retry</Trans>
                        </Button>
                        <Link className={commonStyles.textLink} to="/music/releases">
                            <Trans>Back to releases</Trans>
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <ReleaseDetail
            detail={detail}
            desktop={desktop}
            releaseId={releaseId}
            releaseRating={releaseRating}
            trackRating={trackRating}
        />
    );
};

const ReleaseDetail = ({
    detail,
    desktop,
    releaseId,
    releaseRating,
    trackRating,
}: {
    detail: MusicReleaseDetail;
    desktop: boolean;
    releaseId: number;
    releaseRating?: React.ReactNode;
    trackRating?: (track: MusicTrack) => React.ReactNode;
}) => {
    const {i18n, t} = useLingui();
    const format = useFormatters();
    const {release} = detail;

    return (
        <main className={cn(commonStyles.main, desktop && styles.desktopMain)}>
            <Link className={cn('type-label-sm', styles.backLink)} to="/music/releases">
                <ArrowLeft aria-hidden="true" />
                <Trans>All releases</Trans>
            </Link>
            <section className={cn(styles.hero, desktop && styles.desktopHero)} aria-labelledby="release-title">
                <div className={styles.coverFrame}>
                    {release.selectedCover ? (
                        <img src={release.selectedCover.uri} alt={t`Cover of ${release.name}`} />
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            <Disc3 aria-hidden="true" />
                            <span className="type-meta-sm">
                                <Trans>No artwork</Trans>
                            </span>
                        </div>
                    )}
                </div>
                <div className={styles.releaseInfo}>
                    <p className={cn('type-overline', commonStyles.eyebrow)}>
                        {i18n._(RELEASE_TYPE_MESSAGES[release.releaseType])}
                    </p>
                    <h1 className="type-display-lg" id="release-title">
                        {release.name}
                    </h1>
                    <p className={cn('type-body-lg', styles.credits)}>{release.artistCredits.join(' · ')}</p>
                    <div className={styles.releaseMeta}>
                        {release.releaseDate ? (
                            <Badge variant="outline">{format.dateOnly(release.releaseDate)}</Badge>
                        ) : null}
                        {detail.groups.map(group => (
                            <Badge key={`group-${group.id}`} variant="secondary">
                                {group.name}
                            </Badge>
                        ))}
                        {detail.idols.map(idol => (
                            <Badge key={`idol-${idol.id}`} variant="default">
                                {idol.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </section>
            <section aria-label={t`Release rating`} className={styles.ratingSection}>
                {releaseRating ?? <ReleaseRatingControl releaseId={releaseId} releaseName={release.name} />}
            </section>
            <section aria-labelledby="track-list-heading" className={styles.trackSection}>
                <div className={styles.sectionHeading}>
                    <div>
                        <p className={cn('type-overline', commonStyles.eyebrow)}>
                            <Trans>Ordered play</Trans>
                        </p>
                        <h2 className="type-heading-lg" id="track-list-heading">
                            <Trans>Track list</Trans>
                        </h2>
                    </div>
                    <span className="type-meta-sm">
                        <Plural value={detail.tracks.length} one="# track" other="# tracks" />
                    </span>
                </div>
                {detail.tracks.length ? (
                    <TrackList renderRating={trackRating} tracks={detail.tracks} />
                ) : (
                    <p className={styles.emptyTracks}>
                        <Trans>No tracks are listed for this release.</Trans>
                    </p>
                )}
            </section>
        </main>
    );
};

const TrackList = ({
    renderRating,
    tracks,
}: {
    renderRating?: (track: MusicTrack) => React.ReactNode;
    tracks: MusicTrack[];
}) => {
    const {t} = useLingui();
    const format = useFormatters();
    return (
        <ol className={styles.trackList}>
            {tracks.map((track, index) => (
                <li className={styles.trackItem} key={track.id}>
                    <span className={cn('type-meta-md', styles.trackNumber)}>
                        {track.discNumber && track.trackNumber
                            ? `${format.integer(track.discNumber)}.${format.integer(track.trackNumber)}`
                            : format.integer(index + 1)}
                    </span>
                    <div className={styles.trackInfo}>
                        <strong className="type-label-lg">
                            {track.title}
                            {track.explicit ? (
                                <span className={styles.explicitMark} title={t`Explicit`}>
                                    E
                                </span>
                            ) : null}
                        </strong>
                        <span className="type-meta-sm">
                            {track.artistCredits.length ? (
                                track.artistCredits.join(' · ')
                            ) : (
                                <Trans>Unknown artist</Trans>
                            )}
                            {track.durationMs ? ` · ${format.duration(track.durationMs)}` : null}
                        </span>
                    </div>
                    {renderRating?.(track) ?? <TrackRatingControl trackId={track.id} trackName={track.title} />}
                </li>
            ))}
        </ol>
    );
};

const DetailSkeleton = () => {
    return (
        <div aria-busy="true" className={styles.detailSkeleton}>
            <span />
            <span />
            <span />
        </div>
    );
};
