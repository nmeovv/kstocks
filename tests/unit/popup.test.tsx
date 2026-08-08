import {Trans} from '@lingui/react/macro';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {Button} from '@/components/ui/button';
import {
    PopupClose,
    PopupContent,
    PopupDescription,
    PopupFooter,
    PopupHeader,
    PopupProvider,
    PopupRoot,
    PopupTitle,
    PopupTrigger,
    type PopupPlatform,
} from '@/components/ui/popup';
import {AppI18nProvider} from '@/i18n';

const PopupFixture = ({
    dismissible,
    onOpenChange,
    platform,
}: {
    dismissible?: boolean;
    onOpenChange?: (open: boolean) => void;
    platform: PopupPlatform;
}) => {
    return (
        <AppI18nProvider>
            <PopupProvider platform={platform}>
                <PopupRoot dismissible={dismissible} onOpenChange={onOpenChange}>
                    <PopupTrigger>
                        <Button>
                            <Trans>Open rating details</Trans>
                        </Button>
                    </PopupTrigger>
                    <PopupContent>
                        <PopupHeader>
                            <PopupTitle>
                                <Trans>Rating details</Trans>
                            </PopupTitle>
                            <PopupDescription>
                                <Trans>See how this score was chosen.</Trans>
                            </PopupDescription>
                        </PopupHeader>
                        <PopupFooter>
                            <PopupClose>
                                <Button variant="outline">
                                    <Trans>Done</Trans>
                                </Button>
                            </PopupClose>
                        </PopupFooter>
                    </PopupContent>
                </PopupRoot>
            </PopupProvider>
        </AppI18nProvider>
    );
};

describe.each<PopupPlatform>(['desktop', 'touch'])('Popup on %s', platform => {
    it('opens an accessible modal and closes from the top-right button', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();

        render(<PopupFixture onOpenChange={onOpenChange} platform={platform} />);

        await user.click(screen.getByRole('button', {name: 'Open rating details'}));

        const popup = screen.getByRole('dialog', {name: 'Rating details'});
        expect(popup).toBeVisible();
        expect(screen.getByText('See how this score was chosen.')).toBeVisible();
        expect(onOpenChange).toHaveBeenLastCalledWith(true);

        await user.click(screen.getByRole('button', {name: 'Close popup'}));

        expect(screen.queryByRole('dialog', {name: 'Rating details'})).not.toBeInTheDocument();
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('supports a caller-provided close action', async () => {
        const user = userEvent.setup();

        render(<PopupFixture platform={platform} />);

        await user.click(screen.getByRole('button', {name: 'Open rating details'}));
        await user.click(screen.getByRole('button', {name: 'Done'}));

        expect(screen.queryByRole('dialog', {name: 'Rating details'})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Open rating details'})).toHaveFocus();
    });

    it('prevents incidental dismissal while preserving explicit close actions', async () => {
        const user = userEvent.setup();

        render(<PopupFixture dismissible={false} platform={platform} />);

        await user.click(screen.getByRole('button', {name: 'Open rating details'}));
        await user.keyboard('{Escape}');

        expect(screen.getByRole('dialog', {name: 'Rating details'})).toBeVisible();

        await user.click(screen.getByRole('button', {name: 'Close popup'}));

        expect(screen.queryByRole('dialog', {name: 'Rating details'})).not.toBeInTheDocument();
    });
});

describe('Popup platform presentation', () => {
    it('renders a drag handle only for the touch drawer', async () => {
        const user = userEvent.setup();
        const {container} = render(<PopupFixture platform="touch" />);

        await user.click(screen.getByRole('button', {name: 'Open rating details'}));

        expect(container.ownerDocument.querySelector('[data-slot="popup-handle"]')).toBeInTheDocument();
    });

    it('renders no drag handle for the desktop dialog', async () => {
        const user = userEvent.setup();
        const {container} = render(<PopupFixture platform="desktop" />);

        await user.click(screen.getByRole('button', {name: 'Open rating details'}));

        expect(container.ownerDocument.querySelector('[data-slot="popup-handle"]')).not.toBeInTheDocument();
    });

    it('allows the touch drawer to be dragged down by a swipe', async () => {
        const user = userEvent.setup();

        render(<PopupFixture platform="touch" />);
        await user.click(screen.getByRole('button', {name: 'Open rating details'}));
        await new Promise(resolve => setTimeout(resolve, 550));

        const popup = screen.getByRole('dialog', {name: 'Rating details'});
        vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue({
            bottom: 600,
            height: 500,
            left: 0,
            right: 360,
            top: 100,
            width: 360,
            x: 0,
            y: 100,
            toJSON: () => undefined,
        });
        const swipeSurface = popup.parentElement;

        expect(swipeSurface).not.toBeNull();
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(popup);

        fireEvent.pointerDown(swipeSurface!, {
            button: 0,
            buttons: 1,
            clientY: 120,
            pointerId: 1,
            pointerType: 'mouse',
        });
        fireEvent.pointerMove(swipeSurface!, {buttons: 1, clientY: 130, pointerId: 1, pointerType: 'mouse'});
        fireEvent.pointerMove(swipeSurface!, {buttons: 1, clientY: 420, pointerId: 1, pointerType: 'mouse'});

        expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('290px');

        fireEvent.pointerUp(swipeSurface!, {clientY: 420, pointerId: 1, pointerType: 'mouse'});
    });
});
