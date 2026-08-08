import {expect, test} from '@playwright/test';

test('shows the latest album ratings on mobile', async ({page}) => {
    await page.route('**/api/v1/auth/session', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({authenticated: false}),
        });
    });
    await page.goto('/');

    const feed = page.getByRole('region', {name: 'Latest spins'});

    await expect(feed).toBeVisible();
    await expect(feed.getByRole('article')).toHaveCount(3);
    await expect(feed).toHaveScreenshot('feed-mobile.png', {
        animations: 'disabled',
    });
});
