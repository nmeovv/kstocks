import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans} from '@lingui/react/macro';

import styles from './design-system.module.css';

const Introduction = () => {
    return (
        <main className={styles.page}>
            <header className={styles.intro}>
                <p className="type-overline">
                    <Trans>Album Ratings design system</Trans>
                </p>
                <h1 className="type-display-lg">
                    <Trans>Friendly, tactile, and built from the same code as the product.</Trans>
                </h1>
                <p>
                    <Trans>
                        This catalog documents foundations, reusable components, supported states, and accessibility
                        behavior.
                    </Trans>
                </p>
            </header>
            <section className={styles.manifesto}>
                <article className={styles.manifestoCard}>
                    <h2 className="type-heading-md">
                        <Trans>Foundations first</Trans>
                    </h2>
                    <p className="type-body-sm">
                        <Trans>Color and type are semantic tokens shared directly with the application.</Trans>
                    </p>
                </article>
                <article className={styles.manifestoCard}>
                    <h2 className="type-heading-md">
                        <Trans>Real components</Trans>
                    </h2>
                    <p className="type-body-sm">
                        <Trans>Stories import production primitives instead of maintaining visual copies.</Trans>
                    </p>
                </article>
                <article className={styles.manifestoCard}>
                    <h2 className="type-heading-md">
                        <Trans>States are part of the API</Trans>
                    </h2>
                    <p className="type-body-sm">
                        <Trans>Controls, documentation, and accessibility checks keep edge cases visible.</Trans>
                    </p>
                </article>
            </section>
        </main>
    );
};

const meta = {
    title: 'Introduction',
    component: Introduction,
    parameters: {
        layout: 'fullscreen',
        controls: {disable: true},
    },
} satisfies Meta<typeof Introduction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
