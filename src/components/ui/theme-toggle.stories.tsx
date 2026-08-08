import type {Meta, StoryObj} from '@storybook/react-vite';

import {ThemeToggle} from './theme-toggle';

const meta = {
    title: 'Components/Theme toggle',
    component: ThemeToggle,
    tags: ['autodocs'],
    parameters: {layout: 'centered'},
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focused: Story = {
    play: async ({canvas}) => {
        canvas.getByRole('button').focus();
    },
};
