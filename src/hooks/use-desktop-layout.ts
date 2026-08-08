import {useEffect, useState} from 'react';

const DESKTOP_QUERY = '(min-width: 641px)';

export const useDesktopLayout = () => {
    const [isDesktop, setIsDesktop] = useState(() => matchDesktop());

    useEffect(() => {
        const mediaQuery = window.matchMedia(DESKTOP_QUERY);
        const updateLayout = () => setIsDesktop(mediaQuery.matches);

        updateLayout();
        mediaQuery.addEventListener('change', updateLayout);

        return () => mediaQuery.removeEventListener('change', updateLayout);
    }, []);

    return isDesktop;
};

const matchDesktop = () => {
    return typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches;
};
