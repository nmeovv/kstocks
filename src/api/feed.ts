import type {components} from '@/api/generated/schema';

export type FeedItem = components['schemas']['FeedItem'];
export type FeedResponse = components['schemas']['FeedResponse'];

export interface FeedClient {
    getFeed(): Promise<FeedResponse>;
}
