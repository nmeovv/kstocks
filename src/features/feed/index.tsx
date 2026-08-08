import {type ComponentType, useEffect, useState} from 'react';
import {Trans} from '@lingui/react/macro';

import type {FeedClient, FeedItem} from '@/api/feed';
import {mockFeedClient} from '@/api/mock-feed';

import styles from './styles/index.module.css';

export type FeedViewProps = {items: FeedItem[]};

type FeedProps = {
    client?: FeedClient;
    view: ComponentType<FeedViewProps>;
};

export const Feed = ({client = mockFeedClient, view: View}: FeedProps) => {
    const [items, setItems] = useState<FeedItem[] | null>(null);

    useEffect(() => {
        let active = true;

        void client.getFeed().then(response => {
            if (active) {
                setItems(response.items);
            }
        });

        return () => {
            active = false;
        };
    }, [client]);

    if (!items) {
        return <LoadingFeed />;
    }

    return <View items={items} />;
};

const LoadingFeed = () => {
    return (
        <main aria-busy="true" className={styles.loadingFeed}>
            <p className="type-heading-md">
                <Trans>Dropping the needle…</Trans>
            </p>
        </main>
    );
};
