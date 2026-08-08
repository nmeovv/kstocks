import {defineConfig, devices} from '@playwright/test';

const localBaseUrl = 'http://127.0.0.1:4173';
const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = configuredBaseUrl ?? localBaseUrl;
const touchViewport = {width: 640, height: 844};

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/e2e/artifacts',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['list'], ['html', {outputFolder: 'tests/e2e/report', open: 'never'}]],
    use: {
        baseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome'], viewport: touchViewport},
        },
    ],
    webServer: configuredBaseUrl
        ? undefined
        : {
              command: 'npm run dev -- --host 127.0.0.1 --port 4173',
              url: localBaseUrl,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
