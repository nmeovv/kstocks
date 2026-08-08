import {useEffect, useState} from 'react';
import {Moon, Sun} from 'lucide-react';
import {useLingui} from '@lingui/react/macro';

import styles from './theme-toggle.module.css';

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'album-ratings-theme';

export const ThemeToggle = () => {
    const {t} = useLingui();
    const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
    const isDark = theme === 'dark';
    const label = isDark ? t`Switch to light mode` : t`Switch to dark mode`;

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const nextTheme = document.documentElement.dataset.theme;
            if (nextTheme === 'dark' || nextTheme === 'light') {
                setTheme(nextTheme);
            }
        });

        observer.observe(document.documentElement, {attributeFilter: ['data-theme']});
        return () => observer.disconnect();
    }, []);

    return (
        <button
            aria-label={label}
            aria-pressed={isDark}
            className={styles.toggle}
            title={label}
            type="button"
            onClick={() => setTheme(current => (current === 'dark' ? 'light' : 'dark'))}
        >
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
    );
};

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const documentTheme = document.documentElement.dataset.theme;
    if (documentTheme === 'dark' || documentTheme === 'light') {
        return documentTheme;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
