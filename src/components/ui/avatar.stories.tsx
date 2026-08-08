import type {Meta, StoryObj} from '@storybook/react-vite';

import storyStyles from '@/stories/design-system.module.css';

import {Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount} from './avatar';

const meta = {
    title: 'Components/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    parameters: {layout: 'centered'},
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: () => (
        <div className={storyStyles.row}>
            <Avatar size="sm">
                <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
                <AvatarFallback>AK</AvatarFallback>
                <AvatarBadge />
            </Avatar>
        </div>
    ),
};

export const Group: Story = {
    render: () => (
        <AvatarGroup>
            <Avatar>
                <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
        </AvatarGroup>
    ),
};
