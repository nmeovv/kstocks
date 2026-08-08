import {expect, test} from '@playwright/test';

test('guest opens token login from Telegram', async ({page}) => {
    await page.route('**/api/v1/auth/session', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({authenticated: false}),
            headers: {'Set-Cookie': 'XSRF-TOKEN=mock-csrf; Path=/'},
        });
    });

    await page.goto('/');
    await expect(page.getByRole('button', {name: 'Log in'})).toBeVisible();
    await page.getByRole('button', {name: 'Log in'}).click();
    await expect(page.getByRole('heading', {name: 'Log in through the bot'})).toBeVisible();
    await expect(page.getByLabel('Login token')).toBeVisible();
    await expect(page.getByText('send /login, then paste the token here.')).toBeVisible();

    const popup = page.getByRole('dialog', {name: 'Log in through the bot'});
    await expect(popup).toHaveCSS('width', '640px');
    await expect(popup).toHaveCSS('max-width', 'none');
});
