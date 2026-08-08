import {Button as ButtonPrimitive} from '@base-ui/react/button';

import {cn} from '@/lib/cn';

import styles from './button.module.css';

const BUTTON_VARIANT_CLASSES = {
    default: styles.default,
    secondary: styles.secondary,
    outline: styles.outline,
    destructive: styles.destructive,
    ghost: styles.ghost,
} as const;

const BUTTON_SIZE_CLASSES = {
    sm: styles.sm,
    default: styles.medium,
    lg: styles.lg,
    icon: styles.icon,
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT_CLASSES;
export type ButtonSize = keyof typeof BUTTON_SIZE_CLASSES;

export const buttonVariants = ({
    variant = 'default',
    size = 'default',
}: {
    variant?: ButtonVariant;
    size?: ButtonSize;
} = {}) => {
    return cn(styles.button, BUTTON_VARIANT_CLASSES[variant], BUTTON_SIZE_CLASSES[size]);
};

export const Button = ({
    className,
    variant = 'default',
    size = 'default',
    ...props
}: ButtonPrimitive.Props & {
    variant?: ButtonVariant;
    size?: ButtonSize;
}) => {
    return (
        <ButtonPrimitive
            data-size={size}
            data-slot="button"
            data-variant={variant}
            className={cn(buttonVariants({variant, size}), className)}
            {...props}
        />
    );
};
