import {Trans, useLingui} from '@lingui/react/macro';
import {Plus} from 'lucide-react';
import {Link} from 'react-router-dom';

import {buttonVariants} from '@/components/ui/button';
import {cn} from '@/lib/cn';

import {ArtistCatalog, ArtistOption, ArtistSearch, CatalogState} from './release-list-content';
import type {MusicReleaseListViewProps} from './index';
import styles from './styles/index.module.css';
import touchStyles from './styles/index.touch.module.css';
import commonStyles from '../styles/index.module.css';

const MusicReleaseListTouchView = ({
    artistSearch,
    onArtistSearchChange,
    onRetry,
    onSelectArtist,
    state,
}: MusicReleaseListViewProps) => {
    const {t} = useLingui();

    return (
        <main className={cn(commonStyles.main, touchStyles.main)}>
            <div className={touchStyles.headingRow}>
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
            <ArtistSearch onChange={onArtistSearchChange} value={artistSearch} />
            {state.kind === 'ready' ? (
                <>
                    <div aria-label={t`Artists`} className={touchStyles.artistStrip} role="list">
                        {state.artists.map(artist => (
                            <div key={`${artist.kind}-${artist.id}`} role="listitem">
                                <ArtistOption
                                    artist={artist}
                                    onSelect={onSelectArtist}
                                    selected={
                                        artist.kind === state.selectedArtist.kind &&
                                        artist.id === state.selectedArtist.id
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    {!state.artists.length ? (
                        <p className={cn('type-body-sm', styles.noArtistMatches)}>
                            <Trans>No artists match this search.</Trans>
                        </p>
                    ) : null}
                    <ArtistCatalog artist={state.selectedArtist} onRetry={onRetry} releases={state.releases} />
                </>
            ) : (
                <CatalogState kind={state.kind} onRetry={onRetry} />
            )}
        </main>
    );
};

export default MusicReleaseListTouchView;
