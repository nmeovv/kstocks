import {expect, test} from '@playwright/test';

import {mockMusicUploadApi, spotifyPreview} from './helpers/music-upload-mock';

test('uploads a Spotify-prefilled release with authoritative edits and immutable references', async ({page}) => {
    const requests = await mockMusicUploadApi(page);

    await page.goto('/music/releases');
    await page.getByRole('link', {name: 'Add release'}).click();
    await page.getByLabel('Spotify album URL').fill('https://open.spotify.com/album/1234567890123456789012');
    await page.getByRole('button', {name: 'Preview release'}).click();

    await expect(page.getByLabel('Release name')).toHaveValue('Armageddon');
    await expect(page.getByRole('img', {name: 'Cover for Armageddon'})).toBeVisible();
    await expect(page.getByRole('region', {name: 'Track list'}).getByRole('listitem')).toHaveCount(2);
    await expect(page.getByLabel('Supernova')).toHaveCount(0);

    await page.getByLabel('Release name').fill('Armageddon — Deluxe');
    await page.getByLabel('Release date').fill('2024-06-01');
    await page.getByRole('button', {name: 'Add artist'}).click();
    await page.getByRole('textbox', {name: /Artist 2/}).fill('NINGNING');
    await page.getByRole('button', {name: 'Add release'}).click();

    await expect(page).toHaveURL('/music/releases/911');
    expect(requests.uploads).toHaveLength(1);
    expect(requests.uploads[0]).toMatchObject({
        name: 'Armageddon — Deluxe',
        releaseDate: '2024-06-01',
        artistCredits: ['aespa', 'NINGNING'],
        spotifyReference: spotifyPreview.spotifyReference,
        image: spotifyPreview.image,
        tracks: spotifyPreview.tracks,
    });
    expect(await page.evaluate(() => localStorage.getItem('album-ratings:release-upload:v1'))).toBeNull();
});
