import {useState, type FormEvent} from 'react';
import {KeyRound, LogOut, Send} from 'lucide-react';
import {Trans, useLingui} from '@lingui/react/macro';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {PopupContent, PopupDescription, PopupFooter, PopupHeader, PopupRoot, PopupTitle} from '@/components/ui/popup';
import {cn} from '@/lib/cn';

import {useAuth} from './auth-context';
import styles from './auth.module.css';

export const AuthControl = () => {
    const {t} = useLingui();
    const {state, showLogin, logout, refreshSession} = useAuth();

    if (state.status === 'loading') {
        return (
            <span className={cn('type-meta-sm', styles.status)}>
                <Trans>Checking session…</Trans>
            </span>
        );
    }
    if (state.status === 'error') {
        return (
            <Button size="sm" variant="outline" onClick={() => void refreshSession()}>
                <Trans>Retry</Trans>
            </Button>
        );
    }
    if (state.status === 'guest') {
        return (
            <>
                <Button size="sm" variant="outline" onClick={showLogin}>
                    <Send aria-hidden="true" />
                    <Trans>Log in</Trans>
                </Button>
                <LoginPopup />
            </>
        );
    }

    const name = displayName(state.user) ?? t`Listener`;
    return (
        <div className={styles.identity}>
            <Avatar size="sm">
                {state.user.avatarUrl ? <AvatarImage src={state.user.avatarUrl} alt="" /> : null}
                <AvatarFallback>{initials(state.user)}</AvatarFallback>
            </Avatar>
            <span className={cn('type-label-sm', styles.name)}>{name}</span>
            <Button
                size="icon"
                variant="ghost"
                aria-label={t`Log out`}
                title={t`Log out`}
                onClick={() => void logout()}
            >
                <LogOut aria-hidden="true" />
            </Button>
        </div>
    );
};

export const LoginRequiredPrompt = () => {
    const {loginRequired, dismissLoginPrompt, showLogin} = useAuth();
    if (!loginRequired) {
        return null;
    }
    return (
        <aside className={styles.loginPrompt} aria-live="polite">
            <p className="type-body-sm">
                <Trans>Log in with Telegram to make changes.</Trans>
            </p>
            <div className={styles.promptActions}>
                <Button size="sm" onClick={showLogin}>
                    <Trans>Log in</Trans>
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissLoginPrompt}>
                    <Trans>Not now</Trans>
                </Button>
            </div>
        </aside>
    );
};

const LoginPopup = () => {
    const {t} = useLingui();
    const {login, loginOpen, dismissLogin} = useAuth();
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'invalid' | 'error'>('idle');

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('submitting');
        const result = await login(token);
        if (result === 'success') {
            setToken('');
            setStatus('idle');
            return;
        }
        setStatus(result);
    };

    const close = () => {
        dismissLogin();
        setToken('');
        setStatus('idle');
    };

    return (
        <PopupRoot
            open={loginOpen}
            onOpenChange={open => {
                if (!open) {
                    close();
                }
            }}
        >
            <PopupContent className={styles.loginPopup}>
                <PopupHeader>
                    <span className={styles.loginMark} aria-hidden="true">
                        <KeyRound />
                    </span>
                    <PopupTitle>
                        <Trans>Log in through the bot</Trans>
                    </PopupTitle>
                    <PopupDescription>
                        <Trans>
                            Open a private chat with the Telegram bot, send /login, then paste the token here.
                        </Trans>
                    </PopupDescription>
                </PopupHeader>
                <form className={styles.loginForm} onSubmit={event => void submit(event)}>
                    <label className="type-label-md" htmlFor="telegram-login-token">
                        <Trans>Login token</Trans>
                    </label>
                    <input
                        autoComplete="one-time-code"
                        autoFocus
                        className={styles.tokenInput}
                        id="telegram-login-token"
                        maxLength={128}
                        onChange={event => {
                            setToken(event.target.value);
                            setStatus('idle');
                        }}
                        placeholder={t`Paste the token from Telegram`}
                        spellCheck={false}
                        value={token}
                    />
                    {status === 'invalid' ? (
                        <p className={styles.loginError} role="alert">
                            <Trans>
                                This token is invalid, expired, or has already been used. Send /login again for a new
                                one.
                            </Trans>
                        </p>
                    ) : null}
                    {status === 'error' ? (
                        <p className={styles.loginError} role="alert">
                            <Trans>Login could not be completed. Check your connection and try again.</Trans>
                        </p>
                    ) : null}
                    <PopupFooter>
                        <Button type="button" variant="ghost" onClick={close}>
                            <Trans>Cancel</Trans>
                        </Button>
                        <Button disabled={token.trim().length < 20 || status === 'submitting'} type="submit">
                            <KeyRound aria-hidden="true" />
                            {status === 'submitting' ? <Trans>Logging in…</Trans> : <Trans>Log in</Trans>}
                        </Button>
                    </PopupFooter>
                </form>
            </PopupContent>
        </PopupRoot>
    );
};

const displayName = (user: {firstName: string | null; username: string | null}) => {
    return user.firstName ?? user.username;
};

const initials = (user: {firstName: string | null; lastName: string | null; username: string | null}) => {
    const value = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '?';
    return value
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
};
