import {Trans} from '@lingui/react/macro';
import {Disc3} from 'lucide-react';
import {Link} from 'react-router-dom';

import {AuthControl, LoginRequiredPrompt} from '@/auth/auth-control';
import {ThemeToggle} from '@/components/ui/theme-toggle';
import {cn} from '@/lib/cn';

import {FeedList} from './feed-list';
import type {FeedViewProps} from './index';
import commonStyles from './styles/index.module.css';
import styles from './styles/index.desktop.module.css';

const FeedDesktopView = ({items}: FeedViewProps) => {
    return (
        <div className={commonStyles.pageShell}>
            <header className={cn(commonStyles.siteHeader, styles.siteHeader)}>
                <div className={commonStyles.brandLead}>
                    <div aria-hidden="true" className={commonStyles.recordMark}>
                        <span />
                    </div>
                    <div>
                        <p className="type-display-md">
                            <Trans>Album Ratings</Trans>
                        </p>
                        <p className={cn('type-body-sm', commonStyles.tagline)}>
                            <Trans>Good records travel by word of mouth.</Trans>
                        </p>
                    </div>
                </div>
                <div className={styles.headerEnd}>
                    <p className={cn('type-meta-sm', styles.headerSummary)}>
                        <Trans>Fresh ratings from the people you follow.</Trans>
                    </p>
                    <ThemeToggle />
                    <AuthControl />
                </div>
            </header>
            <LoginRequiredPrompt />
            <Link className={commonStyles.musicLink} to="/music/releases">
                <Disc3 aria-hidden="true" />
                <Trans>Open music catalog</Trans>
            </Link>
            <main className={styles.main}>
                <section aria-labelledby="feed-heading" className={commonStyles.feedSection}>
                    <div className={cn(commonStyles.sectionHeading, styles.sectionHeading)}>
                        <div>
                            <p className={cn('type-overline', commonStyles.eyebrow)}>
                                <Trans>From your people</Trans>
                            </p>
                            <h1 className="type-display-lg" id="feed-heading">
                                <Trans>Latest spins</Trans>
                            </h1>
                        </div>
                        <p className="type-body-sm">
                            <Trans>Fresh ratings, no algorithm.</Trans>
                        </p>
                    </div>
                    <FeedList items={items} />
                </section>
            </main>
        </div>
    );
};

export default FeedDesktopView;
