import {mergeProps} from '@base-ui/react/merge-props';
import {useRender} from '@base-ui/react/use-render';

import {cn} from '@/lib/cn';

import styles from './badge.module.css';

const BADGE_VARIANT_CLASSES = {
    default: styles.default,
    secondary: styles.secondary,
    destructive: styles.destructive,
    outline: styles.outline,
    ghost: styles.ghost,
    link: styles.link,
} as const;

type BadgeVariant = keyof typeof BADGE_VARIANT_CLASSES;

export const badgeVariants = ({variant = 'default'}: {variant?: BadgeVariant} = {}) => {
    return cn(styles.badge, BADGE_VARIANT_CLASSES[variant]);
};

export const Badge = ({
    className,
    variant = 'default',
    render,
    ...props
}: useRender.ComponentProps<'span'> & {variant?: BadgeVariant}) => {
    return useRender({
        defaultTagName: 'span',
        props: mergeProps<'span'>(
            {
                className: cn(badgeVariants({variant}), className),
            },
            props,
        ),
        render,
        state: {
            slot: 'badge',
            variant,
        },
    });
};
