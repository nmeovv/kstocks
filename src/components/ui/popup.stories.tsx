import type {Meta, StoryObj} from '@storybook/react-vite';

import {PopupPreview} from '@/stories/popup-preview';

import {PopupProvider, PopupRoot} from './popup';

const meta = {
    title: 'Components/Popup',
    component: PopupRoot,
    tags: ['autodocs'],
    args: {
        children: null,
    },
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof PopupRoot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Touch: Story = {
    render: () => (
        <PopupProvider platform="touch">
            <PopupPreview />
        </PopupProvider>
    ),
};

export const Desktop: Story = {
    render: () => (
        <PopupProvider platform="desktop">
            <PopupPreview />
        </PopupProvider>
    ),
};
