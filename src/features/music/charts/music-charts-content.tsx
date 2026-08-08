import type {ReactNode} from 'react';
import {Plural, Trans} from '@lingui/react/macro';
import {ChartNoAxesColumnIncreasing, Trophy} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {MusicRatedTarget, MusicTrackCriterion} from '@/api/music';
import {Button} from '@/components/ui/button';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import type {MusicChartsViewProps} from './index';
import styles from './music-charts.module.css';
import commonStyles from '../styles/index.module.css';

export const MusicChartsContent = ({
    criterion,
    desktop = false,
    onRetry,
    releases,
    status,
    tracks,
}: MusicChartsViewProps & {desktop?: boolean}) => {
    return (
        <main className={commonStyles.main}>
            <div className={cn(commonStyles.pageHeading, desktop && styles.desktopHeading)}>
                <div>
                    <p className={cn('type-overline', commonStyles.eyebrow)}>
                        <Trans>Community signal</Trans>
                    </p>
                    <h1 className="type-display-lg">
                        <Trans>Charts</Trans>
                    </h1>
                </div>
                <p className={cn('type-body-sm', commonStyles.lede)}>
                    <Trans>Seven-plus releases and tracks, ranked by the ratings that count right now.</Trans>
                </p>
            </div>
            {status === 'loading' ? <ChartSkeleton /> : null}
            {status === 'error' ? (
                <section className={commonStyles.statePanel} data-tone="error" role="alert">
                    <h2 className="type-heading-md">
                        <Trans>The charts could not be loaded.</Trans>
                    </h2>
                    <Button onClick={onRetry}>
                        <Trans>Retry</Trans>
                    </Button>
                </section>
            ) : null}
            {status === 'ready' ? (
                <div className={cn(styles.chartGrid, desktop && styles.desktopGrid)}>
                    <ChartSection
                        icon={<Trophy />}
                        targets={releases ?? []}
                        title={<Trans>Highly rated releases</Trans>}
                        release
                    />
                    <section>
                        <div className={styles.sectionTitle}>
                            <ChartNoAxesColumnIncreasing aria-hidden="true" />
                            <div>
                                <p className="type-overline">
                                    <Trans>Track criterion</Trans>
                                </p>
                                <h2 className="type-heading-lg">
                                    <Trans>Highly rated tracks</Trans>
                                </h2>
                            </div>
                        </div>
                        <div className={styles.criteria}>
                            <CriterionLink active={criterion === 'average'} criterion="average">
                                <Trans>Average 7+</Trans>
                            </CriterionLink>
                            <CriterionLink active={criterion === 'any'} criterion="any">
                                <Trans>Any 7+ vote</Trans>
                            </CriterionLink>
                        </div>
                        <ChartList targets={tracks ?? []} />
                    </section>
                </div>
            ) : null}
        </main>
    );
};

const ChartSection = ({
    icon,
    release = false,
    targets,
    title,
}: {
    icon: ReactNode;
    release?: boolean;
    targets: MusicRatedTarget[];
    title: ReactNode;
}) => {
    return (
        <section>
            <div className={styles.sectionTitle}>
                {icon}
                <h2 className="type-heading-lg">{title}</h2>
            </div>
            <ChartList release={release} targets={targets} />
        </section>
    );
};

const ChartList = ({release = false, targets}: {release?: boolean; targets: MusicRatedTarget[]}) => {
    const format = useFormatters();
    if (!targets.length) {
        return (
            <div className={styles.emptyChart}>
                <Trans>No ratings meet this chart yet.</Trans>
            </div>
        );
    }
    return (
        <ol className={styles.chartList}>
            {targets.map((target, index) => {
                const content = (
                    <>
                        <span className={cn('type-meta-md', styles.rank)}>{format.integer(index + 1)}</span>
                        <span className={cn('type-label-lg', styles.targetName)}>{target.name}</span>
                        <span className={styles.targetScore}>
                            <strong className="type-heading-md">{format.score(target.average)}</strong>
                            <span className="type-meta-sm">
                                <Plural value={target.voterCount} one="# vote" other="# votes" />
                            </span>
                        </span>
                    </>
                );
                return (
                    <li key={target.id}>
                        {release ? (
                            <Link className={styles.chartRow} to={`/music/releases/${target.id}`}>
                                {content}
                            </Link>
                        ) : (
                            <div className={styles.chartRow}>{content}</div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
};

const CriterionLink = ({
    active,
    children,
    criterion,
}: {
    active: boolean;
    children: ReactNode;
    criterion: MusicTrackCriterion;
}) => {
    return (
        <Link className={cn(styles.criterion, active && styles.criterionActive)} to={`?criterion=${criterion}`}>
            {children}
        </Link>
    );
};

const ChartSkeleton = () => {
    return (
        <div aria-busy="true" className={styles.skeleton}>
            <span />
            <span />
        </div>
    );
};
