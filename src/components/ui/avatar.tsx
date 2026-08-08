import * as React from 'react';
import {Avatar as AvatarPrimitive} from '@base-ui/react/avatar';

import {cn} from '@/lib/cn';

import styles from './avatar.module.css';

export const Avatar = ({
    className,
    size = 'default',
    ...props
}: AvatarPrimitive.Root.Props & {
    size?: 'default' | 'sm' | 'lg';
}) => {
    return (
        <AvatarPrimitive.Root data-slot="avatar" data-size={size} className={cn(styles.root, className)} {...props} />
    );
};

export const AvatarImage = ({className, ...props}: AvatarPrimitive.Image.Props) => {
    return <AvatarPrimitive.Image data-slot="avatar-image" className={cn(styles.image, className)} {...props} />;
};

export const AvatarFallback = ({className, ...props}: AvatarPrimitive.Fallback.Props) => {
    return (
        <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn(styles.fallback, className)} {...props} />
    );
};

export const AvatarBadge = ({className, ...props}: React.ComponentProps<'span'>) => {
    return <span data-slot="avatar-badge" className={cn(styles.badge, className)} {...props} />;
};

export const AvatarGroup = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="avatar-group" className={cn(styles.group, className)} {...props} />;
};

export const AvatarGroupCount = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="avatar-group-count" className={cn(styles.groupCount, className)} {...props} />;
};
