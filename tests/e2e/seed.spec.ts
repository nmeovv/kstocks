import {test} from '@playwright/test';

test.describe('agent seed', () => {
    test('opens the application', async ({page}) => {
        await page.goto('/');
    });
});
