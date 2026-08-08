import * as React from 'react';

import {cn} from '@/lib/cn';

import styles from './card.module.css';

export const Card = ({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<'div'> & {size?: 'default' | 'sm'}) => {
    return <div data-slot="card" data-size={size} className={cn(styles.card, className)} {...props} />;
};

export const CardHeader = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="card-header" className={cn(styles.header, className)} {...props} />;
};

export const CardTitle = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="card-title" className={cn(styles.title, className)} {...props} />;
};

export const CardDescription = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="card-description" className={cn(styles.description, className)} {...props} />;
};

export const CardAction = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="card-action" className={cn(styles.action, className)} {...props} />;
};

export const CardContent = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="card-content" className={cn(styles.content, className)} {...props} />;
};

export const CardFooter = ({className, ...props}: React.ComponentProps<'div'>) => {
    return <div data-slot="card-footer" className={cn(styles.footer, className)} {...props} />;
};
