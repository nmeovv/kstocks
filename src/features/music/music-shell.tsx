import type {ReactNode} from 'react';
import {Trans, useLingui} from '@lingui/react/macro';
import {BarChart3, Disc3, ListMusic, RadioTower} from 'lucide-react';
import {Link, NavLink} from 'react-router-dom';

import {AuthControl, LoginRequiredPrompt} from '@/auth/auth-control';
import {useAuth} from '@/auth/auth-context';
import {Button} from '@/components/ui/button';
import {ThemeToggle} from '@/components/ui/theme-toggle';
import {cn} from '@/lib/cn';

import commonStyles from './styles/index.module.css';
import desktopStyles from './styles/index.desktop.module.css';
import touchStyles from './styles/index.touch.module.css';

export type MusicPlatform = 'desktop' | 'touch';

export const MusicShell = ({children, platform}: {children: ReactNode; platform: MusicPlatform}) => {
    const {t} = useLingui();
    const platformStyles = platform === 'desktop' ? desktopStyles : touchStyles;

    return (
        <div className={cn(commonStyles.pageShell, platformStyles.pageShell)}>
            <header className={cn(commonStyles.siteHeader, platformStyles.siteHeader)}>
                <Link className={commonStyles.brandLead} to="/">
                    <span aria-hidden="true" className={commonStyles.recordMark}>
                        <span />
                    </span>
                    <span>
                        <span className="type-display-md">
                            <Trans>Album Ratings</Trans>
                        </span>
                        <span className={cn('type-meta-sm', commonStyles.tagline)}>
                            <Trans>K-pop, scored in fine grooves.</Trans>
                        </span>
                    </span>
                </Link>
                <div className={commonStyles.headerActions}>
                    <ThemeToggle />
                    <AuthControl />
                </div>
            </header>
            <nav aria-label={t`Music`} className={cn(commonStyles.nav, platformStyles.nav)}>
                <NavItem icon={<ListMusic />} label={<Trans>Releases</Trans>} to="/music/releases" />
                <NavItem icon={<RadioTower />} label={<Trans>My ratings</Trans>} to="/music/my-ratings" />
                <NavItem icon={<BarChart3 />} label={<Trans>Charts</Trans>} to="/music/charts" />
            </nav>
            <LoginRequiredPrompt />
            {children}
        </div>
    );
};

export const MusicAuthGate = ({children}: {children: ReactNode}) => {
    const {state, showLogin, refreshSession} = useAuth();

    if (state.status === 'authenticated') {
        return children;
    }
    if (state.status === 'loading') {
        return <MusicLoading />;
    }
    if (state.status === 'error') {
        return (
            <StatePanel title={<Trans>The session could not be checked.</Trans>} tone="error">
                <Button onClick={() => void refreshSession()}>
                    <Trans>Retry</Trans>
                </Button>
            </StatePanel>
        );
    }
    return (
        <StatePanel title={<Trans>Your music shelf is ready when you are.</Trans>} tone="sky">
            <p className="type-body-sm">
                <Trans>Log in with Telegram to browse the catalog and rate releases.</Trans>
            </p>
            <Button onClick={showLogin}>
                <Trans>Log in</Trans>
            </Button>
        </StatePanel>
    );
};

export const MusicLoading = () => {
    return (
        <div aria-busy="true" className={commonStyles.loading}>
            <Disc3 aria-hidden="true" />
            <p className="type-heading-sm">
                <Trans>Dropping the needle…</Trans>
            </p>
        </div>
    );
};

export const StatePanel = ({
    children,
    title,
    tone = 'paper',
}: {
    children?: ReactNode;
    title: ReactNode;
    tone?: 'error' | 'paper' | 'sky';
}) => {
    return (
        <section className={commonStyles.statePanel} data-tone={tone}>
            <h2 className="type-heading-md">{title}</h2>
            {children}
        </section>
    );
};

const NavItem = ({icon, label, to}: {icon: ReactNode; label: ReactNode; to: string}) => {
    return (
        <NavLink className={({isActive}) => cn(commonStyles.navLink, isActive && commonStyles.navLinkActive)} to={to}>
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};
