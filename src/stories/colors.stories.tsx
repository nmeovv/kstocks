import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans} from '@lingui/react/macro';

import styles from './design-system.module.css';

const COLOR_TOKENS = [
    {name: 'background', value: '#fff4dd'},
    {name: 'card', value: '#fffdf7'},
    {name: 'foreground', value: '#26201a'},
    {name: 'primary', value: '#ff5b35'},
    {name: 'accent', value: '#ffd84d'},
    {name: 'muted', value: '#ffb9cc'},
    {name: 'sky', value: '#a5dcff'},
    {name: 'destructive', value: '#d92d20'},
] as const;

const Colors = () => {
    return (
        <main className={styles.page}>
            <header className={styles.intro}>
                <h1 className="type-display-lg">
                    <Trans>Color</Trans>
                </h1>
                <p>
                    <Trans>Semantic tokens keep product intent stable while individual colors can evolve.</Trans>
                </p>
            </header>
            <div className={styles.grid}>
                {COLOR_TOKENS.map(token => (
                    <article className={styles.tokenCard} key={token.name}>
                        <div
                            aria-hidden="true"
                            className={styles.swatch}
                            style={{background: `var(--${token.name})`}}
                        />
                        <div className={styles.tokenMeta}>
                            <strong className="type-heading-md">--{token.name}</strong>
                            <code className={`${styles.tokenValue} type-meta-sm`}>{token.value}</code>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
};

const meta = {
    title: 'Foundations/Colors',
    component: Colors,
    parameters: {
        layout: 'fullscreen',
        controls: {disable: true},
    },
} satisfies Meta<typeof Colors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {};
