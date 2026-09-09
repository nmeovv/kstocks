import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans} from '@lingui/react/macro';

import styles from './design-system.module.css';
import {useCssColors} from './use-css-colors';

const COLOR_TOKENS = ['background', 'card', 'foreground', 'primary', 'accent', 'muted', 'sky', 'destructive'] as const;

const Colors = () => {
    const colors = useCssColors();
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
                    <article className={styles.tokenCard} key={token}>
                        <div aria-hidden="true" className={styles.swatch} style={{background: `var(--${token})`}} />
                        <div className={styles.tokenMeta}>
                            <strong className="type-heading-md">--{token}</strong>
                            <code className={`${styles.tokenValue} type-meta-sm`}>{colors?.[token]}</code>
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
