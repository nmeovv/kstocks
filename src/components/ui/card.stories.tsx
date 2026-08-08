import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans} from '@lingui/react/macro';

import {Badge} from './badge';
import {Button} from './button';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from './card';
import storyStyles from '@/stories/design-system.module.css';

const meta = {
    title: 'Components/Card',
    component: Card,
    tags: ['autodocs'],
    parameters: {layout: 'centered'},
    decorators: [
        Story => (
            <div className={storyStyles.cardStage}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
    render: () => (
        <Card>
            <CardHeader>
                <CardTitle className="type-heading-md">
                    <Trans>Blue Lines</Trans>
                </CardTitle>
                <CardDescription>
                    <Trans>Massive Attack · 1991</Trans>
                </CardDescription>
                <CardAction>
                    <Badge variant="secondary">9.2</Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Trans>A landmark record built from dub, soul, and nocturnal tension.</Trans>
            </CardContent>
            <CardFooter>
                <Button size="sm">
                    <Trans>View rating</Trans>
                </Button>
            </CardFooter>
        </Card>
    ),
};
