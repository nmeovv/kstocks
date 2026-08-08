# Album Ratings

A mobile-first React app for rating albums and tracks. It uses Vite, Base UI,
Lingui, and CSS Modules.

## Setup

```bash
nvm use
npm install
npm run dev
```

The dev server prints its local URL. Run `npm run storybook` to open the component
catalog on port 6006.

## Checks

```bash
npm run test:unit
npm run test:e2e
npm run build
npm run prettier
```

Install the pinned Chromium build before the first E2E run:

```bash
npm run test:e2e:install
```

Playwright starts the local Vite server unless `PLAYWRIGHT_BASE_URL` points to a
deployed app. Reports go to `tests/e2e/report`; traces, screenshots, and videos go
to `tests/e2e/artifacts`.

## Review screenshot changes

Open Playwright UI mode and run the changed test:

```bash
npm run test:e2e:ui
```

Compare Expected, Actual, and Diff in the Attachments tab. Once the change looks
right, expand Testing Options, set Update snapshots to Changed, and rerun the
test. UI mode keeps this setting separately, so passing `--update-snapshots` on
the command line may not change how reruns behave inside the UI.

To update the changed snapshots for one reviewed test outside UI mode, use its
name or file path:

```bash
npm run test:e2e:update -- --grep "test name"
npm run test:e2e:update -- tests/e2e/popup.spec.ts
```

To update every changed snapshot in the test suite automatically, run:

```bash
npm run test:e2e:update
```

To regenerate every snapshot, including baselines whose pixels still match,
run `npm run test:e2e -- --update-snapshots=all`. Review the changed image files
before committing them. Never update screenshot baselines in CI.

## Generated files

`openapi/api.yaml` is the API contract. After changing it, run `npm run gen:api`
and commit `src/api/generated/schema.ts`. Do not edit that file by hand.

Run `npm run i18n:extract` after changing translatable copy.
