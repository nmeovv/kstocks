import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {getAuthSession, loginWithToken, logoutSession, type AuthenticatedUser} from '@/api/auth';
import {clearReleaseUploadDraft} from '@/features/music/release-upload/draft-storage';

export type AuthState =
    {status: 'loading'} | {status: 'guest'} | {status: 'authenticated'; user: AuthenticatedUser} | {status: 'error'};

type AuthContextValue = {
    state: AuthState;
    loginRequired: boolean;
    loginOpen: boolean;
    login: (token: string) => Promise<'success' | 'invalid' | 'error'>;
    showLogin: () => void;
    dismissLogin: () => void;
    logout: () => Promise<void>;
    refreshSession: () => Promise<boolean>;
    notifyUnauthenticated: () => void;
    dismissLoginPrompt: () => void;
};

type AuthProviderProps = {children: ReactNode};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({children}: AuthProviderProps) => {
    const navigate = useNavigate();
    const [state, setState] = useState<AuthState>({status: 'loading'});
    const [loginRequired, setLoginRequired] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    const refreshSession = useCallback(async () => {
        const result = await getAuthSession();
        if (!result.ok) {
            setState({status: 'error'});
            return false;
        }
        setState(result.data.authenticated ? {status: 'authenticated', user: result.data.user} : {status: 'guest'});
        return result.data.authenticated;
    }, []);

    useEffect(() => {
        void refreshSession();
    }, [refreshSession]);

    const login = useCallback(
        async (token: string) => {
            const result = await loginWithToken(token.trim());
            if (!result.ok) {
                return result.kind === 'unauthenticated' ? 'invalid' : 'error';
            }
            if (!(await refreshSession())) {
                return 'error';
            }
            setLoginRequired(false);
            setLoginOpen(false);
            return 'success';
        },
        [refreshSession],
    );

    const logout = useCallback(async () => {
        const result = await logoutSession();
        if (result.ok || result.kind === 'unauthenticated') {
            clearReleaseUploadDraft();
            setState({status: 'guest'});
            setLoginRequired(false);
            navigate('/');
        }
    }, [navigate]);

    const value = useMemo<AuthContextValue>(
        () => ({
            state,
            loginRequired,
            loginOpen,
            login,
            showLogin: () => setLoginOpen(true),
            dismissLogin: () => setLoginOpen(false),
            logout,
            refreshSession,
            notifyUnauthenticated: () => setLoginRequired(true),
            dismissLoginPrompt: () => setLoginRequired(false),
        }),
        [state, loginRequired, loginOpen, login, logout, refreshSession],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
};
