import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans, useLingui} from '@lingui/react/macro';
import {Heart, Plus} from 'lucide-react';

import {Button} from './button';
import storyStyles from '@/stories/design-system.module.css';

const meta = {
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'secondary', 'outline', 'destructive', 'ghost'],
        },
        size: {
            control: 'select',
            options: ['sm', 'default', 'lg', 'icon'],
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const ButtonSizes = () => {
    const {t} = useLingui();

    return (
        <div className={storyStyles.row}>
            <Button size="sm">
                <Plus data-icon="inline-start" />
                <Trans>Small</Trans>
            </Button>
            <Button>
                <Plus data-icon="inline-start" />
                <Trans>Default</Trans>
            </Button>
            <Button size="lg">
                <Plus data-icon="inline-start" />
                <Trans>Large</Trans>
            </Button>
            <Button aria-label={t`Add to favorites`} size="icon" variant="secondary">
                <Heart />
            </Button>
        </div>
    );
};

export const Playground: Story = {
    args: {
        variant: 'default',
        size: 'default',
    },
    render: args => (
        <Button {...args}>
            <Trans>Rate this album</Trans>
        </Button>
    ),
};

export const Variants: Story = {
    render: () => (
        <div className={storyStyles.row}>
            <Button>
                <Trans>Primary action</Trans>
            </Button>
            <Button variant="secondary">
                <Trans>Add to list</Trans>
            </Button>
            <Button variant="outline">
                <Trans>View details</Trans>
            </Button>
            <Button variant="destructive">
                <Trans>Delete rating</Trans>
            </Button>
            <Button variant="ghost">
                <Trans>Cancel</Trans>
            </Button>
        </div>
    ),
};

export const Sizes: Story = {
    render: () => <ButtonSizes />,
};

export const States: Story = {
    render: () => (
        <div className={storyStyles.row}>
            <Button>
                <Trans>Enabled</Trans>
            </Button>
            <Button disabled>
                <Trans>Disabled</Trans>
            </Button>
        </div>
    ),
};
