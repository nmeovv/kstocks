import {
    createContext,
    useContext,
    type ComponentProps,
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {Drawer} from '@base-ui/react/drawer';
import {useLingui} from '@lingui/react/macro';
import {XIcon} from 'lucide-react';

import {cn} from '@/lib/cn';

import {Button} from './button';
import styles from './popup.module.css';

export type PopupPlatform = 'desktop' | 'touch';
export type PopupCardTilt = 'left' | 'none' | 'right';

const PopupPlatformContext = createContext<PopupPlatform | null>(null);

export const PopupProvider = ({children, platform}: {children: ReactNode; platform: PopupPlatform}) => {
    return <PopupPlatformContext value={platform}>{children}</PopupPlatformContext>;
};

export const PopupRoot = ({
    children,
    defaultOpen,
    dismissible = true,
    modal = true,
    onOpenChange,
    open,
}: {
    children: ReactNode;
    defaultOpen?: boolean;
    dismissible?: boolean;
    modal?: boolean;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
}) => {
    const platform = usePopupPlatform();

    if (platform === 'touch') {
        return (
            <Drawer.Root
                defaultOpen={defaultOpen}
                disablePointerDismissal={!dismissible}
                modal={modal}
                onOpenChange={(nextOpen, eventDetails) => {
                    if (!dismissible && !nextOpen && eventDetails.reason !== 'close-press') {
                        eventDetails.cancel();
                        return;
                    }

                    onOpenChange?.(nextOpen);
                }}
                open={open}
                swipeDirection="down"
            >
                {children}
            </Drawer.Root>
        );
    }

    return (
        <Dialog.Root
            defaultOpen={defaultOpen}
            disablePointerDismissal={!dismissible}
            modal={modal}
            onOpenChange={(nextOpen, eventDetails) => {
                if (!dismissible && !nextOpen && eventDetails.reason !== 'close-press') {
                    eventDetails.cancel();
                    return;
                }

                onOpenChange?.(nextOpen);
            }}
            open={open}
        >
            {children}
        </Dialog.Root>
    );
};

export const PopupTrigger = ({children}: {children: ReactElement}) => {
    const platform = usePopupPlatform();

    if (platform === 'touch') {
        return <Drawer.Trigger render={children} />;
    }

    return <Dialog.Trigger render={children} />;
};

export const PopupContent = ({children, className}: {children: ReactNode; className?: string}) => {
    const platform = usePopupPlatform();

    if (platform === 'touch') {
        return (
            <Drawer.Portal>
                <Drawer.Backdrop className={cn(styles.backdrop, styles.touchBackdrop)} />
                <Drawer.Viewport className={styles.touchViewport}>
                    <Drawer.Popup className={cn(styles.popup, styles.touchPopup, className)}>
                        <div aria-hidden="true" className={styles.handle} data-slot="popup-handle" />
                        <PopupDefaultClose />
                        <Drawer.Content className={styles.touchContent}>{children}</Drawer.Content>
                    </Drawer.Popup>
                </Drawer.Viewport>
            </Drawer.Portal>
        );
    }

    return (
        <Dialog.Portal>
            <Dialog.Backdrop className={styles.backdrop} />
            <Dialog.Viewport className={styles.viewport}>
                <Dialog.Popup className={cn(styles.popup, styles.desktopPopup, className)}>
                    <PopupDefaultClose />
                    {children}
                </Dialog.Popup>
            </Dialog.Viewport>
        </Dialog.Portal>
    );
};

export const PopupHeader = ({className, ...props}: HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn(styles.header, className)} {...props} />;
};

export const PopupEyebrow = ({className, ...props}: ComponentProps<'span'>) => {
    return <span className={cn('type-overline', styles.eyebrow, className)} {...props} />;
};

export const PopupBody = ({className, ...props}: HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn(styles.body, className)} {...props} />;
};

export const PopupCard = ({
    className,
    tilt = 'left',
    ...props
}: HTMLAttributes<HTMLDivElement> & {tilt?: PopupCardTilt}) => {
    return <div className={cn(styles.card, className)} data-tilt={tilt} {...props} />;
};

export const PopupActions = ({className, ...props}: HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn(styles.actions, className)} {...props} />;
};

export const PopupFooter = ({className, ...props}: HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn(styles.footer, className)} {...props} />;
};

export const PopupFooterNote = ({className, ...props}: ComponentProps<'p'>) => {
    return <p className={cn('type-meta-sm', styles.footerNote, className)} {...props} />;
};

export const PopupTitle = ({className, ...props}: ComponentProps<'h2'>) => {
    const platform = usePopupPlatform();
    const titleClassName = cn('type-heading-md', styles.title, className);

    if (platform === 'touch') {
        return <Drawer.Title className={titleClassName} {...props} />;
    }

    return <Dialog.Title className={titleClassName} {...props} />;
};

export const PopupDescription = ({className, ...props}: ComponentProps<'p'>) => {
    const platform = usePopupPlatform();
    const descriptionClassName = cn('type-body-md', styles.description, className);

    if (platform === 'touch') {
        return <Drawer.Description className={descriptionClassName} {...props} />;
    }

    return <Dialog.Description className={descriptionClassName} {...props} />;
};

export const PopupClose = ({children}: {children: ReactElement}) => {
    const platform = usePopupPlatform();

    if (platform === 'touch') {
        return <Drawer.Close render={children} />;
    }

    return <Dialog.Close render={children} />;
};

const PopupDefaultClose = () => {
    const {t} = useLingui();

    return (
        <PopupClose>
            <Button aria-label={t`Close popup`} className={styles.close} size="icon" variant="outline">
                <XIcon data-icon="inline-start" />
            </Button>
        </PopupClose>
    );
};

const usePopupPlatform = () => {
    const platform = useContext(PopupPlatformContext);

    if (!platform) {
        throw new Error('Popup components must be rendered inside PopupProvider');
    }

    return platform;
};
