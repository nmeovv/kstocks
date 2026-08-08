import type {ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Trans} from '@lingui/react/macro';

import styles from './design-system.module.css';

const Typography = () => {
    return (
        <main className={styles.page}>
            <header className={styles.intro}>
                <h1 className="type-display-lg">
                    <Trans>Typography</Trans>
                </h1>
                <p className="type-body-md">
                    <Trans>
                        A reusable scale for expressive display text, readable body copy, strong labels, and compact
                        metadata.
                    </Trans>
                </p>
            </header>
            <TypeSection title={<Trans>Display</Trans>}>
                <TypeSpecimen className="type-display-lg" roleName=".type-display-lg">
                    <Trans>What are you listening to?</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-display-md" roleName=".type-display-md">
                    <Trans>Needle Drop</Trans>
                </TypeSpecimen>
            </TypeSection>
            <TypeSection title={<Trans>Headings</Trans>}>
                <TypeSpecimen className="type-heading-lg" roleName=".type-heading-lg">
                    <Trans>Albums of the year</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-heading-md" roleName=".type-heading-md">
                    <Trans>Blue Lines</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-heading-sm" roleName=".type-heading-sm">
                    <Trans>Listening notes</Trans>
                </TypeSpecimen>
            </TypeSection>
            <TypeSection title={<Trans>Body</Trans>}>
                <TypeSpecimen className="type-body-lg" roleName=".type-body-lg">
                    <Trans>A generous introduction for an important feature or editorial moment.</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-body-md" roleName=".type-body-md">
                    <Trans>Comfortable reading text for reviews, descriptions, and product guidance.</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-body-sm" roleName=".type-body-sm">
                    <Trans>A quiet classic that gets better every year.</Trans>
                </TypeSpecimen>
            </TypeSection>
            <TypeSection title={<Trans>Labels</Trans>}>
                <TypeSpecimen className="type-label-lg" roleName=".type-label-lg">
                    <Trans>Maya Lewis</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-label-md" roleName=".type-label-md">
                    <Trans>Save rating</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-label-sm" roleName=".type-label-sm">
                    <Trans>Following</Trans>
                </TypeSpecimen>
            </TypeSection>
            <TypeSection title={<Trans>Metadata</Trans>}>
                <TypeSpecimen className="type-meta-md" roleName=".type-meta-md">
                    <Trans>@mayaplays · 08 AUG 2026</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-meta-sm" roleName=".type-meta-sm">
                    <Trans>1991 · 9.2 / 10</Trans>
                </TypeSpecimen>
                <TypeSpecimen className="type-overline" roleName=".type-overline">
                    <Trans>Latest ratings</Trans>
                </TypeSpecimen>
            </TypeSection>
        </main>
    );
};

const meta = {
    title: 'Foundations/Typography',
    component: Typography,
    parameters: {
        layout: 'fullscreen',
        controls: {disable: true},
    },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roles: Story = {};

const TypeSpecimen = ({className, roleName, children}: {className: string; roleName: string; children: ReactNode}) => {
    return (
        <article className={styles.typeRow}>
            <code className={`${styles.typeMeta} type-meta-sm`}>{roleName}</code>
            <p className={className}>{children}</p>
        </article>
    );
};

const TypeSection = ({title, children}: {title: ReactNode; children: ReactNode}) => {
    return (
        <section className={styles.typeSection}>
            <h2 className="type-heading-lg">{title}</h2>
            <div className={styles.typeList}>{children}</div>
        </section>
    );
};
