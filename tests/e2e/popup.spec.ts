import {expect, test} from '@playwright/test';

const POPUP_VIEWPORTS = [
    {height: 844, name: 'touch', width: 640},
    {height: 768, name: 'desktop', width: 1024},
] as const;

for (const viewport of POPUP_VIEWPORTS) {
    test(`shows the popup on ${viewport.name}`, async ({page}) => {
        await page.setViewportSize({width: viewport.width, height: viewport.height});
        await page.goto('/__popup-preview__');
        await page.getByRole('button', {name: 'Open popup'}).click();

        const popup = page.getByRole('dialog', {name: 'Rate this album'});

        await expect(popup).toBeVisible();

        if (viewport.name === 'touch') {
            await expect(page.locator('[data-slot="popup-handle"]')).toBeVisible();
        } else {
            await expect(page.locator('[data-slot="popup-handle"]')).toHaveCount(0);
        }

        await expect(page).toHaveScreenshot(`popup-${viewport.name}.png`, {
            animations: 'disabled',
            caret: 'hide',
        });
    });
}
