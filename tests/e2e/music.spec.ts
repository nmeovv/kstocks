import {expect, test, type Page} from '@playwright/test';

import type {MusicReleaseRatingValue, MusicTrackRatingValue} from '../../src/api/music';

const artwork = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#ff5b35"/>
  <circle cx="300" cy="300" r="210" fill="#26201a"/>
  <circle cx="300" cy="300" r="150" fill="none" stroke="#ffb9cc" stroke-width="28"/>
  <path d="M135 330 300 90l165 240-165 180z" fill="#ffd84d"/>
  <circle cx="300" cy="300" r="34" fill="#a5dcff" stroke="#26201a" stroke-width="12"/>
</svg>`)} `;

const release = {
    id: 101,
    name: 'Armageddon',
    releaseType: 'album',
    releaseDate: '2024-05-27',
    artistCredits: ['aespa'],
    selectedCover: {id: 1, source: 'custom', uri: artwork, width: 600, height: 600, preferred: true},
};
const detail = {
    release,
    images: [{id: 1, source: 'custom', uri: artwork, width: 600, height: 600, preferred: true}],
    groups: [{id: 44, name: 'aespa'}],
    idols: [{id: 87, name: 'NINGNING'}],
    tracks: [
        {
            id: 201,
            title: 'Supernova',
            discNumber: 1,
            trackNumber: 1,
            durationMs: 178880,
            explicit: false,
            artistCredits: ['aespa'],
        },
        {
            id: 202,
            title: 'Armageddon',
            discNumber: 1,
            trackNumber: 2,
            durationMs: 196720,
            explicit: true,
            artistCredits: ['aespa'],
        },
        {
            id: 203,
            title: 'Long Chat (#♥)',
            discNumber: 2,
            trackNumber: 1,
            durationMs: 195140,
            explicit: false,
            artistCredits: ['aespa'],
        },
    ],
};

test('rates a release and track across the mobile music journey', async ({page}) => {
    const requests = await mockMusicApi(page);

    await page.goto('/music/releases');
    await expect(page.getByRole('heading', {name: 'Find an artist'})).toBeVisible();
    await expect(page.getByRole('heading', {name: 'aespa'})).toBeVisible();
    await expect(page.getByRole('link', {name: /Armageddon/})).toBeVisible();
    await expect(page).toHaveScreenshot('music-catalog-mobile.png', {
        animations: 'disabled',
        caret: 'hide',
        fullPage: true,
    });

    await page.getByRole('link', {name: /Armageddon/}).click();
    await expect(page.getByRole('heading', {name: 'Armageddon', exact: true})).toBeVisible();
    await expect(page.getByRole('region', {name: 'Track list'}).getByRole('listitem')).toHaveCount(3);
    const tracks = await page.getByRole('region', {name: 'Track list'}).getByRole('listitem').allTextContents();
    expect(tracks[0]).toContain('Supernova');
    expect(tracks[1]).toContain('Armageddon');
    expect(tracks[2]).toContain('Long Chat');
    await expect(page).toHaveScreenshot('music-detail-mobile.png', {
        animations: 'disabled',
        caret: 'hide',
        fullPage: true,
    });

    await page.getByRole('region', {name: 'Release rating'}).getByRole('button', {name: 'Rate Armageddon'}).click();
    await expect(page.getByRole('dialog', {name: 'Rate Armageddon'})).toBeVisible();
    await expect(page).toHaveScreenshot('music-rating-open-mobile.png', {
        animations: 'disabled',
        caret: 'hide',
        fullPage: true,
    });
    await page.getByRole('radio', {name: 'Strong 8'}).click();
    await page.getByRole('button', {name: 'Save rating'}).click();
    await expect(page.getByRole('region', {name: 'Release rating'}).getByText('Strong 8', {exact: true})).toBeVisible();
    expect(requests.releasePuts).toEqual([{score: 8, strength: 'strong'}]);

    await page.getByRole('button', {name: 'Rate Supernova'}).click();
    await page.getByRole('radio', {name: '9'}).click();
    await page.getByRole('button', {name: 'Save rating'}).click();
    expect(requests.trackPuts).toEqual([{score: 9}]);

    await page.getByRole('button', {name: 'Rate Supernova'}).click();
    await page.getByRole('button', {name: 'Clear rating'}).click();
    expect(requests.trackDeletes).toBe(1);

    await page.getByRole('button', {name: '3 voters'}).first().click();
    await expect(page.getByText('deleted user')).toBeVisible();
});

test('shows the complete release workspace on desktop', async ({page}) => {
    await page.setViewportSize({width: 1024, height: 768});
    await mockMusicApi(page);
    await page.goto('/music/releases/101');

    await expect(page.getByRole('heading', {name: 'Armageddon', exact: true})).toBeVisible();
    await expect(page).toHaveScreenshot('music-detail-desktop.png', {
        animations: 'disabled',
        caret: 'hide',
        fullPage: true,
    });
});

test('shows the artist rail and release grid on desktop', async ({page}) => {
    await page.setViewportSize({width: 1024, height: 768});
    await mockMusicApi(page);
    await page.goto('/music/releases');

    await expect(page.getByRole('button', {name: 'aespa'})).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('region', {name: 'aespa releases'}).getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('navigation', {name: 'Music'})).toBeVisible();
});

test('shows the artist strip and two-column release grid on touch', async ({page}) => {
    await mockMusicApi(page);
    await page.goto('/music/releases');

    await expect(page.getByRole('button', {name: 'aespa'})).toHaveAttribute('aria-pressed', 'true');
    const releaseList = page.getByRole('region', {name: 'aespa releases'}).getByRole('list');
    await expect(releaseList.getByRole('listitem')).toHaveCount(2);
    await expect(releaseList).toHaveCSS('grid-template-columns', /\S+ \S+/);
});

test('resets malformed release filters to the first catalog artist', async ({page}) => {
    await mockMusicApi(page);
    await page.goto('/music/releases?groupId=invalid');

    await expect(page.getByText('That artist could not be found.')).toBeVisible();
    await page.getByRole('button', {name: 'Retry'}).click();

    await expect(page).toHaveURL(/\/music\/releases$/);
    await expect(page.getByRole('link', {name: /Armageddon/})).toBeVisible();
});

const mockMusicApi = async (page: Page) => {
    let releaseRating: {score: number; strength?: string} | null = null;
    const trackRatings = new Map<number, number>();
    const requests: MusicRatingRequests = {releasePuts: [], trackPuts: [], trackDeletes: 0};

    await page.route('**/api/v1/auth/session', route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                authenticated: true,
                user: {id: 7, username: 'listener', firstName: 'Mina', lastName: null, avatarUrl: null},
            }),
        }),
    );
    await page.route('**/api/v1/music/**', async route => {
        const request = route.request();
        const url = new URL(request.url());
        const method = request.method();
        const path = `${url.pathname}${url.search}`;
        const fulfill = (body: unknown) =>
            route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(body)});

        if (path === '/api/v1/music/artists') {
            return fulfill([
                {kind: 'group', id: 44, name: 'aespa'},
                {kind: 'group', id: 45, name: 'Red Velvet'},
                {kind: 'idol', id: 87, name: 'NINGNING'},
            ]);
        }
        if (path === '/api/v1/music/releases?groupId=44') {
            return fulfill([
                release,
                {
                    id: 102,
                    name: 'Savage',
                    releaseType: 'ep',
                    releaseDate: '2021-10-05',
                    artistCredits: ['aespa'],
                    selectedCover: null,
                },
            ]);
        }
        if (path === '/api/v1/music/releases/101') {
            return fulfill(detail);
        }
        if (path === '/api/v1/music/releases/101/rating' && method === 'GET') {
            return fulfill({
                current: releaseRating,
                aggregate: {average: 8.3, voterCount: 3},
                nearestAggregateState: {score: 8, strength: 'strong'},
            });
        }
        if (path === '/api/v1/music/releases/101/rating' && method === 'PUT') {
            const body: unknown = request.postDataJSON();
            if (!isReleaseRatingValue(body)) {
                return route.fulfill({status: 400});
            }
            releaseRating = body;
            requests.releasePuts.push(body);
            return fulfill({changed: true});
        }
        if (path === '/api/v1/music/releases/101/voters') {
            return fulfill([
                {userId: 1, displayName: 'vinylcat', score: 9, strength: 'weak', updatedAt: '2026-08-20T10:00:00Z'},
                {
                    userId: null,
                    displayName: 'deleted user',
                    score: 8,
                    strength: 'strong',
                    updatedAt: '2026-08-19T10:00:00Z',
                },
            ]);
        }
        const ratingMatch = url.pathname.match(/^\/api\/v1\/music\/tracks\/(\d+)\/rating$/);
        if (ratingMatch) {
            const trackId = Number(ratingMatch[1]);
            if (method === 'GET') {
                const current = trackRatings.get(trackId);
                return fulfill({current: current ? {score: current} : null, aggregate: {average: 8.2, voterCount: 2}});
            }
            if (method === 'PUT') {
                const body: unknown = request.postDataJSON();
                if (!isTrackRatingValue(body)) {
                    return route.fulfill({status: 400});
                }
                requests.trackPuts.push(body);
                trackRatings.set(trackId, body.score);
                return fulfill({changed: true});
            }
            if (method === 'DELETE') {
                requests.trackDeletes += 1;
                trackRatings.delete(trackId);
                return fulfill({changed: true});
            }
        }
        if (/\/api\/v1\/music\/tracks\/\d+\/voters$/.test(url.pathname)) {
            return fulfill([]);
        }
        return route.fulfill({status: 404});
    });
    return requests;
};

type MusicRatingRequests = {
    releasePuts: MusicReleaseRatingValue[];
    trackPuts: MusicTrackRatingValue[];
    trackDeletes: number;
};

const isReleaseRatingValue = (value: unknown): value is MusicReleaseRatingValue => {
    if (!isRecord(value) || !isRatingScore(value.score)) {
        return false;
    }
    const endpoint = value.score === 0 || value.score === 10;
    return endpoint
        ? value.strength === undefined
        : value.strength === 'weak' || value.strength === 'decent' || value.strength === 'strong';
};

const isTrackRatingValue = (value: unknown): value is MusicTrackRatingValue => {
    return isRecord(value) && isRatingScore(value.score) && value.score > 0;
};

const isRatingScore = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};
