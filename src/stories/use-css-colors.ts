import {useLayoutEffect, useState} from 'react';

/** Read after styles mount, then refresh when the Storybook theme changes. */
export const useCssColors = () => {
    const [colors, setColors] = useState<ReturnType<typeof readCssColors> | null>(null);

    useLayoutEffect(() => {
        const refresh = () => setColors(readCssColors());
        refresh();
        const observer = new MutationObserver(refresh);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'style', 'class'],
        });
        return () => observer.disconnect();
    }, []);

    return colors;
};

const readCssColors = () => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string) => styles.getPropertyValue(`--${name}`).trim();
    return {
        background: read('background'),
        card: read('card'),
        foreground: read('foreground'),
        primary: read('primary'),
        accent: read('accent'),
        muted: read('muted'),
        sky: read('sky'),
        destructive: read('destructive'),
        'brand-accent': read('brand-accent'),
        ink: read('ink'),
        rose: read('rose'),
        sun: read('sun'),
    };
};
