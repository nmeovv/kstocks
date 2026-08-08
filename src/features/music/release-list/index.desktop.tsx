import {Trans, useLingui} from '@lingui/react/macro';
import {Plus} from 'lucide-react';
import {Link} from 'react-router-dom';

import {buttonVariants} from '@/components/ui/button';
import {cn} from '@/lib/cn';

import {ArtistCatalog, ArtistOption, ArtistSearch, CatalogState} from './release-list-content';
import type {MusicReleaseListViewProps} from './index';
import styles from './styles/index.module.css';
import desktopStyles from './styles/index.desktop.module.css';
import commonStyles from '../styles/index.module.css';

const MusicReleaseListDesktopView = ({
    artistSearch,
    onArtistSearchChange,
    onRetry,
    onSelectArtist,
    state,
}: MusicReleaseListViewProps) => {
    const {t} = useLingui();

    return (
        <main className={cn(commonStyles.main, desktopStyles.main)}>
            <aside className={desktopStyles.artistRail}>
                <div className={desktopStyles.headingRow}>
                    <div>
                        <p className={cn('type-overline', commonStyles.eyebrow)}>
                            <Trans>Browse music</Trans>
                        </p>
                        <h1 className="type-display-lg">
                            <Trans>Find an artist</Trans>
                        </h1>
                    </div>
                    <Link
                        aria-label={t`Add release`}
                        className={cn(buttonVariants({size: 'icon'}), styles.addRelease)}
                        to="/music/releases/new"
                    >
                        <Plus aria-hidden="true" />
                    </Link>
                </div>
                <ArtistSearch
                    className={desktopStyles.artistSearch}
                    onChange={onArtistSearchChange}
                    value={artistSearch}
                />
                {state.kind === 'ready' ? (
                    <div aria-label={t`Artists`} className={desktopStyles.artistList} role="list">
                        {state.artists.map(artist => (
                            <div key={`${artist.kind}-${artist.id}`} role="listitem">
                                <ArtistOption
                                    artist={artist}
                                    className={desktopStyles.artistOption}
                                    onSelect={onSelectArtist}
                                    selected={
                                        artist.kind === state.selectedArtist.kind &&
                                        artist.id === state.selectedArtist.id
                                    }
                                />
                            </div>
                        ))}
                        {!state.artists.length ? (
                            <p className={cn('type-body-sm', styles.noArtistMatches)}>
                                <Trans>No artists match this search.</Trans>
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </aside>
            {state.kind === 'ready' ? (
                <ArtistCatalog
                    artist={state.selectedArtist}
                    className={desktopStyles.artistCatalog}
                    onRetry={onRetry}
                    releases={state.releases}
                />
            ) : (
                <div className={desktopStyles.artistCatalog}>
                    <CatalogState kind={state.kind} onRetry={onRetry} />
                </div>
            )}
        </main>
    );
};

export default MusicReleaseListDesktopView;
