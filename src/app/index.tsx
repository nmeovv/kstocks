import {useDesktopLayout} from '@/hooks/use-desktop-layout';
import {PopupProvider} from '@/components/ui/popup';
import {PopupPreview} from '@/stories/popup-preview';

import AppDesktop from './index.desktop';
import AppTouch from './index.touch';

export const App = () => {
    const isDesktop = useDesktopLayout();
    const isPopupPreview = import.meta.env.DEV && window.location.pathname === '/__popup-preview__';

    return (
        <PopupProvider platform={isDesktop ? 'desktop' : 'touch'}>
            {isPopupPreview ? <PopupPreview /> : isDesktop ? <AppDesktop /> : <AppTouch />}
        </PopupProvider>
    );
};
