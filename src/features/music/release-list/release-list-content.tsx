import {msg} from '@lingui/core/macro';
import {Plural, Trans, useLingui} from '@lingui/react/macro';
import {Disc3} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {MusicArtistSummary, MusicReleaseSummary} from '@/api/music';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import type {MusicReleaseListState} from './index';
import styles from './styles/index.module.css';
import commonStyles from '../styles/index.module.css';

const RELEASE_TYPE_MESSAGES = {
    album: msg({message: 'Album', context: 'music release type'}),
    ep: msg({message: 'EP', context: 'music release type'}),
    single: msg({message: 'Single', context: 'music release type'}),
    compilation: msg({message: 'Compilation', context: 'music release type'}),
    other: msg({message: 'Other', context: 'music release type'}),
};

export const ArtistOption = ({
    artist,
    className,
    onSelect,
    selected,
}: {
    artist: MusicArtistSummary;
    className?: string;
    onSelect: (artist: MusicArtistSummary) => void;
    selected: boolean;
}) => {
    return (
        <button
            aria-pressed={selected}
            className={cn(styles.artistOption, className, selected && styles.artistOptionSelected)}
            onClick={() => onSelect(artist)}
            type="button"
        >
            <span aria-hidden="true" className={styles.artistInitial}>
                {artist.name.slice(0, 1).toLocaleUpperCase()}
            </span>
            <span className={styles.artistName}>{artist.name}</span>
        </button>
    );
};

export const ArtistSearch = ({
    className,
    onChange,
    value,
}: {
    className?: string;
    onChange: (value: string) => void;
    value: string;
}) => {
    const {t} = useLingui();

    return (
        <input
            aria-label={t`Find a group or idol`}
            className={cn(styles.artistSearch, className)}
            onChange={event => onChange(event.target.value)}
            placeholder={t`Group or idol`}
            type="search"
            value={value}
        />
    );
};

export const ArtistCatalog = ({
    artist,
    className,
    onRetry,
    releases,
}: {
    artist: MusicArtistSummary;
    className?: string;
    onRetry: () => void;
    releases: Extract<MusicReleaseListState, {kind: 'ready'}>['releases'];
}) => {
    const {t} = useLingui();
    const releaseCount = releases.kind === 'populated' ? releases.items.length : 0;

    return (
        <section aria-label={t`${artist.name} releases`} className={className}>
            <div className={styles.artistHero}>
                <p className={cn('type-overline', commonStyles.eyebrow)}>
                    <Trans>Selected artist</Trans>
                </p>
                <h2 className="type-display-lg">{artist.name}</h2>
                {releases.kind === 'populated' || releases.kind === 'empty' ? (
                    <p className={cn('type-body-sm', styles.releaseCount)}>
                        <Plural value={releaseCount} one="# release" other="# releases" />
                    </p>
                ) : null}
            </div>
            <ReleaseResults artist={artist} onRetry={onRetry} releases={releases} />
        </section>
    );
};

export const CatalogState = ({
    kind,
    onRetry,
}: {
    kind: Exclude<MusicReleaseListState['kind'], 'ready'>;
    onRetry: () => void;
}) => {
    if (kind === 'catalog-loading') {
        return <ReleaseGridSkeleton />;
    }
    if (kind === 'catalog-error') {
        return (
            <StatePanel
                description={<Trans>The artist list could not be loaded. Try again.</Trans>}
                onRetry={onRetry}
                title={<Trans>Artists are unavailable.</Trans>}
            />
        );
    }
    if (kind === 'selection-error') {
        return (
            <StatePanel
                description={<Trans>Choose an artist from the catalog to continue.</Trans>}
                onRetry={onRetry}
                title={<Trans>That artist could not be found.</Trans>}
            />
        );
    }
    return (
        <section className={commonStyles.statePanel}>
            <Disc3 aria-hidden="true" />
            <h2 className="type-heading-md">
                <Trans>No artists are in the catalog yet.</Trans>
            </h2>
            <p className="type-body-sm">
                <Trans>Check back after the next catalog import.</Trans>
            </p>
        </section>
    );
};

const ReleaseResults = ({
    artist,
    onRetry,
    releases,
}: {
    artist: MusicArtistSummary;
    onRetry: () => void;
    releases: Extract<MusicReleaseListState, {kind: 'ready'}>['releases'];
}) => {
    if (releases.kind === 'loading') {
        return <ReleaseGridSkeleton />;
    }
    if (releases.kind === 'error') {
        return (
            <StatePanel
                description={<Trans>The releases for this artist could not be loaded. Try again.</Trans>}
                onRetry={onRetry}
                title={<Trans>Releases are unavailable.</Trans>}
            />
        );
    }
    if (releases.kind === 'empty') {
        return (
            <section className={commonStyles.statePanel}>
                <Disc3 aria-hidden="true" />
                <h3 className="type-heading-md">
                    <Trans>No releases for {artist.name} yet.</Trans>
                </h3>
                <p className="type-body-sm">
                    <Trans>Check back after the next catalog import.</Trans>
                </p>
            </section>
        );
    }
    return <ReleaseGrid releases={releases.items} />;
};

const ReleaseGrid = ({releases}: {releases: MusicReleaseSummary[]}) => {
    const {i18n, t} = useLingui();
    const format = useFormatters();

    return (
        <ul className={styles.releaseGrid}>
            {releases.map(release => (
                <li key={release.id}>
                    <Link className={styles.releaseCard} to={`/music/releases/${release.id}`}>
                        {release.selectedCover ? (
                            <img
                                alt={t`Cover of ${release.name} by ${release.artistCredits.join(', ')}`}
                                className={styles.releaseCover}
                                src={release.selectedCover.uri}
                            />
                        ) : (
                            <span aria-hidden="true" className={styles.coverFallback}>
                                <Disc3 />
                            </span>
                        )}
                        <span className={styles.releaseDetails}>
                            <strong className="type-heading-sm">{release.name}</strong>
                            <span className={styles.releaseMeta}>
                                <Badge variant="secondary">{i18n._(RELEASE_TYPE_MESSAGES[release.releaseType])}</Badge>
                                {release.releaseDate ? (
                                    <span className="type-meta-sm">{format.dateOnly(release.releaseDate)}</span>
                                ) : (
                                    <span className="type-meta-sm">
                                        <Trans>Date unknown</Trans>
                                    </span>
                                )}
                            </span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

const ReleaseGridSkeleton = () => {
    return (
        <div aria-busy="true" className={styles.skeletonGrid}>
            {Array.from({length: 4}, (_, index) => (
                <span key={index} />
            ))}
        </div>
    );
};

const StatePanel = ({
    description,
    onRetry,
    title,
}: {
    description: React.ReactNode;
    onRetry: () => void;
    title: React.ReactNode;
}) => {
    return (
        <section className={commonStyles.statePanel} data-tone="error" role="alert">
            <h2 className="type-heading-md">{title}</h2>
            <p className="type-body-sm">{description}</p>
            <Button onClick={onRetry}>
                <Trans>Retry</Trans>
            </Button>
        </section>
    );
};
