import {useMemo} from 'react';
import {useLingui} from '@lingui/react/macro';

export interface Formatters {
    date(value: string | Date): string;
    dateOnly(value: string): string;
    duration(value: number): string;
    integer(value: number): string;
    relativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string;
    score(value: number): string;
}

export const useFormatters = (): Formatters => {
    const {i18n} = useLingui();

    return useMemo(() => createFormatters(i18n.locale), [i18n.locale]);
};

const createFormatters = (locale: string): Formatters => {
    const date = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
    });
    const dateOnly = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    });
    const integer = new Intl.NumberFormat(locale, {maximumFractionDigits: 0});
    const relativeTime = new Intl.RelativeTimeFormat(locale, {numeric: 'auto'});
    const score = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
    });

    return {
        date: value => date.format(new Date(value)),
        dateOnly: value => dateOnly.format(new Date(`${value}T00:00:00Z`)),
        duration: value => {
            const totalSeconds = Math.max(0, Math.floor(value / 1000));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${integer.format(minutes)}:${String(seconds).padStart(2, '0')}`;
        },
        integer: value => integer.format(value),
        relativeTime: (value, unit) => relativeTime.format(value, unit),
        score: value => score.format(value),
    };
};
