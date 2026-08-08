import {useState} from 'react';
import {Trans} from '@lingui/react/macro';

import {Button} from '@/components/ui/button';
import {
    PopupActions,
    PopupBody,
    PopupCard,
    PopupClose,
    PopupContent,
    PopupDescription,
    PopupEyebrow,
    PopupFooterNote,
    PopupHeader,
    PopupRoot,
    PopupTitle,
    PopupTrigger,
} from '@/components/ui/popup';

import styles from './popup-preview.module.css';

const SCORE_OPTIONS = [7, 8, 9, 10] as const;

export const PopupPreview = () => {
    const [score, setScore] = useState(9);

    return (
        <main className={styles.stage}>
            <PopupRoot>
                <PopupTrigger>
                    <Button>
                        <Trans>Open popup</Trans>
                    </Button>
                </PopupTrigger>
                <PopupContent>
                    <PopupHeader>
                        <PopupEyebrow>
                            <Trans>Your rating</Trans>
                        </PopupEyebrow>
                        <PopupTitle>
                            <Trans>Rate this album</Trans>
                        </PopupTitle>
                        <PopupDescription>
                            <Trans>Share a score with the people who follow you.</Trans>
                        </PopupDescription>
                    </PopupHeader>
                    <PopupBody>
                        <PopupCard className={styles.albumCard}>
                            <div>
                                <p className="type-heading-sm">
                                    <Trans>Blue Lines</Trans>
                                </p>
                                <p className="type-body-sm">
                                    <Trans>Massive Attack · 1991</Trans>
                                </p>
                            </div>
                            <strong className={styles.score}>{score}.0</strong>
                        </PopupCard>
                        <fieldset className={styles.scorePicker}>
                            <legend className="type-label-md">
                                <Trans>Choose a score</Trans>
                            </legend>
                            <div>
                                {SCORE_OPTIONS.map(value => (
                                    <label className="type-label-md" key={value}>
                                        <input
                                            checked={score === value}
                                            name="rating-score"
                                            type="radio"
                                            value={value}
                                            onChange={() => setScore(value)}
                                        />
                                        <span>{value}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </PopupBody>
                    <PopupActions>
                        <Button size="lg">
                            <Trans>Save rating</Trans>
                        </Button>
                        <PopupClose>
                            <Button variant="outline">
                                <Trans>Cancel</Trans>
                            </Button>
                        </PopupClose>
                    </PopupActions>
                    <PopupFooterNote>
                        <Trans>You can change this score at any time.</Trans>
                    </PopupFooterNote>
                </PopupContent>
            </PopupRoot>
        </main>
    );
};
