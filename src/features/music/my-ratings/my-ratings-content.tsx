import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {Disc3, ExternalLink} from 'lucide-react';
import {Link} from 'react-router-dom';

import {Button} from '@/components/ui/button';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import type {MusicMyRatingsViewProps} from './index';
import styles from './my-ratings.module.css';
import commonStyles from '../styles/index.module.css';

const STRENGTH_MESSAGES = {
    weak: msg({message: 'Weak', context: 'release rating strength'}),
    decent: msg({message: 'Decent', context: 'release rating strength'}),
    strong: msg({message: 'Strong', context: 'release rating strength'}),
};

export const MusicMyRatingsContent = ({
    desktop = false,
    onRetry,
    ratings,
    status,
}: MusicMyRatingsViewProps & {desktop?: boolean}) => {
    const {i18n} = useLingui();
    const format = useFormatters();
    return (
        <main className={commonStyles.main}>
            <div className={cn(commonStyles.pageHeading, desktop && styles.desktopHeading)}>
                <div>
                    <p className={cn('type-overline', commonStyles.eyebrow)}>
                        <Trans>Your listening ledger</Trans>
                    </p>
                    <h1 className="type-display-lg">
                        <Trans>My ratings</Trans>
                    </h1>
                </div>
                <p className={cn('type-body-sm', commonStyles.lede)}>
                    <Trans>Your latest release and track scores, ordered by the last change.</Trans>
                </p>
            </div>
            {status === 'loading' ? <RatingsSkeleton /> : null}
            {status === 'error' ? (
                <section className={commonStyles.statePanel} data-tone="error" role="alert">
                    <h2 className="type-heading-md">
                        <Trans>Your ratings could not be loaded.</Trans>
                    </h2>
                    <Button onClick={onRetry}>
                        <Trans>Retry</Trans>
                    </Button>
                </section>
            ) : null}
            {status === 'empty' ? (
                <section className={commonStyles.statePanel}>
                    <Disc3 aria-hidden="true" />
                    <h2 className="type-heading-md">
                        <Trans>Your rating ledger is empty.</Trans>
                    </h2>
                    <p className="type-body-sm">
                        <Trans>Open a release and leave your first score.</Trans>
                    </p>
                    <Link className={commonStyles.textLink} to="/music/releases">
                        <Trans>Browse releases</Trans>
                    </Link>
                </section>
            ) : null}
            {status === 'populated' ? (
                <ol className={cn(styles.ratingList, desktop && styles.desktopList)}>
                    {ratings?.map(rating => {
                        const strength = rating.strength ? `${i18n._(STRENGTH_MESSAGES[rating.strength])} ` : '';
                        const content = (
                            <>
                                <span className={styles.ratingIdentity}>
                                    <span className="type-overline">
                                        {rating.targetType === 'release' ? (
                                            <Trans>Release</Trans>
                                        ) : (
                                            <Trans>Track</Trans>
                                        )}
                                    </span>
                                    <strong className="type-heading-md">{rating.targetName}</strong>
                                    <span className="type-meta-sm">{format.date(rating.updatedAt)}</span>
                                </span>
                                <span className={cn('type-display-md', styles.score)}>
                                    {strength}
                                    {format.integer(rating.score)}
                                </span>
                                {rating.targetType === 'release' ? <ExternalLink aria-hidden="true" /> : null}
                            </>
                        );
                        return (
                            <li key={`${rating.targetType}-${rating.targetId}`}>
                                {rating.targetType === 'release' ? (
                                    <Link className={styles.ratingCard} to={`/music/releases/${rating.targetId}`}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div className={styles.ratingCard}>{content}</div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            ) : null}
        </main>
    );
};

const RatingsSkeleton = () => {
    return (
        <div aria-busy="true" className={styles.skeleton}>
            <span />
            <span />
            <span />
        </div>
    );
};
