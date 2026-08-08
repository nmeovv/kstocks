import {Trans, useLingui} from '@lingui/react/macro';

import type {FeedItem} from '@/api/feed';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardFooter, CardHeader} from '@/components/ui/card';
import {useFormatters} from '@/i18n';
import {cn} from '@/lib/cn';

import styles from './feed-list.module.css';

export const FeedList = ({items}: {items: FeedItem[]}) => {
    const {t} = useLingui();

    return (
        <ol aria-label={t`Latest album ratings`} className={styles.list}>
            {items.map(item => (
                <FeedCard item={item} key={item.id} />
            ))}
        </ol>
    );
};

const FeedCard = ({item}: {item: FeedItem}) => {
    const {t} = useLingui();
    const format = useFormatters();
    const score = format.score(item.rating);

    return (
        <li>
            <Card
                aria-label={t`${item.user.displayName} rated ${item.album.title} ${score} out of 10`}
                className={styles.card}
                data-artwork={item.album.artwork}
                role="article"
            >
                <CardHeader className={styles.cardHeader}>
                    <Avatar size="lg">
                        <AvatarFallback>{item.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className={styles.identity}>
                        <p className={cn('type-label-lg', styles.truncate)}>{item.user.displayName}</p>
                        <p className={cn('type-meta-sm', styles.truncate, styles.mutedText)}>{item.user.handle}</p>
                    </div>
                    <time className={cn('type-meta-sm', styles.timestamp)} dateTime={item.ratedAt}>
                        {format.date(item.ratedAt)}
                    </time>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                    <div aria-hidden="true" className={styles.albumArt} data-artwork={item.album.artwork}>
                        <span />
                    </div>
                    <div className={styles.albumDetails}>
                        <p className="type-heading-md">{item.album.title}</p>
                        <p className={cn('type-body-sm', styles.artist)}>{item.album.artist}</p>
                        <p className={cn('type-meta-sm', styles.releaseYear)}>{item.album.releaseYear}</p>
                    </div>
                </CardContent>
                <CardFooter className={styles.cardFooter}>
                    <span className={cn('type-overline', styles.mutedText)}>
                        <Trans>Rating</Trans>
                    </span>
                    <Badge aria-label={t`${score} out of 10`}>
                        <Trans>{score} / 10</Trans>
                    </Badge>
                </CardFooter>
            </Card>
        </li>
    );
};
