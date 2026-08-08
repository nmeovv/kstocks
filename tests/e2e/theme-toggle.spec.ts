import {expect, test} from '@playwright/test';

test('shows the focused circular theme control and switches themes', async ({page}) => {
    await page.route('**/api/v1/auth/session', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({authenticated: false}),
        });
    });
    await page.goto('/');

    const toggle = page.getByRole('button', {name: 'Switch to dark mode'});
    await toggle.focus();

    await expect(page.locator('header')).toHaveScreenshot('theme-toggle-focused.png', {
        animations: 'disabled',
    });

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', {name: 'Switch to light mode'})).toBeVisible();
    await expect(page).toHaveScreenshot('feed-dark-mobile.png', {
        animations: 'disabled',
    });
});
