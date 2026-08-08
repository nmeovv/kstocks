import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans} from '@lingui/react/macro';

import storyStyles from '@/stories/design-system.module.css';

import {Badge} from './badge';

const meta = {
    title: 'Components/Badge',
    component: Badge,
    tags: ['autodocs'],
    parameters: {layout: 'centered'},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className={storyStyles.row}>
            <Badge>
                <Trans>New rating</Trans>
            </Badge>
            <Badge variant="secondary">
                <Trans>Following</Trans>
            </Badge>
            <Badge variant="outline">8.7 / 10</Badge>
            <Badge variant="destructive">
                <Trans>Removed</Trans>
            </Badge>
            <Badge variant="ghost">
                <Trans>Draft</Trans>
            </Badge>
            <Badge variant="link">
                <Trans>See profile</Trans>
            </Badge>
        </div>
    ),
};
