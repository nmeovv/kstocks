# Project Guidance

## Mobile-first UI

Design and implement every product surface for touch-sized viewports first. Base styles are the mobile experience; add larger-screen enhancements with `min-width` breakpoints only after the mobile layout is complete. Keep primary actions reachable, tap targets comfortable, and screenshot coverage centered on the mobile feed unless a feature explicitly requires another viewport.

## Responsive spacing

The reference layout has one structural breakpoint: mobile through `640px`, then the wider layout from `641px`. Keep mobile declarations as the base CSS and express wider enhancements with `@media (min-width: 641px)`. Keep the `useDesktopLayout` query synchronized with this exact threshold. Do not add intermediate layout breakpoints without a concrete content constraint.

Use 16px horizontal page gutters and 56px bottom padding on touch layouts. At 641px and above, use 24px gutters and 72px bottom padding. Masthead top spacing steps from 24px to 34px. Primary content begins 26px below the masthead; later section boundaries use 46px. Section headings stack with a 4px gap on touch and become inline with a 14px gap on wider layouts. Feed items use a 22px vertical gap, and card-like message surfaces use 14px vertical by 18px horizontal inner padding.

Keep capability queries separate from layout. Use `(hover: hover)` only for hover affordances and `prefers-reduced-motion` for motion reduction; neither should change structural spacing.

## Visual depth

Use the reference site's crisp, ink-colored offset shadows as a defining part of the visual language. Shadows have no blur and use `#26201a`: standard cards use `4px 4px 0`, compact controls and artwork use `3px 3px 0`, and only a true feature surface may use `6px 6px 0`. Pair them with the existing 2px ink border instead of soft elevation or translucent drop shadows.

Interactive controls should feel physically pressed: on active state, move the control toward its shadow by 2–3px and reduce the shadow to `1px 1px 0` or remove it. Keep decorative rotation subtle so it does not weaken the consistent shadow direction.

## Component organization

Define every authored function as an arrow function assigned to a `const`; do not use function declarations or `function` expressions. This includes React components, hooks, helpers, callbacks, and configuration utilities. Use `export const name = (...) => ...` for named exports. For default exports, we try to avoid them.

In component files, order declarations like a Java class: data/configuration constants first, public exported functions and components next, and private non-exported functions and components last. Classify declarations by behavior, not by their syntax.

## Platform-specific views

The platform boundary belongs to the application shell. Keep `src/app/index.tsx` as the single place that calls `useDesktopLayout`, and put the desktop and touch application trees in `src/app/index.desktop.tsx` and `src/app/index.touch.tsx`. Register new pages in both application trees so each tree composes the matching platform view. Do not repeat viewport detection in individual pages or lower-level components.

When a page or substantial feature has meaningfully different platform markup, give it its own directory. Keep data loading, state, and actions in its unsuffixed `index.tsx` controller, and place presentation in `index.desktop.tsx` and `index.touch.tsx`. The application trees pass the matching platform view into the shared controller. Keep lower-level components that do not differ by platform unsuffixed, eagerly imported, and free of duplicated business logic. Do not create a lazy boundary for every component.

Mirror that structure for platform-specific styling under `styles/`: `index.module.css` contains shared styles, while `index.desktop.module.css` and `index.touch.module.css` contain only their platform additions or overrides. Import the matching platform stylesheet from each platform view. A component whose markup and styles are shared does not need platform suffixes or a `styles/` directory merely for consistency.

Source-file separation does not require bundle splitting. Eagerly import small platform views by default so they remain in the same Vite entry bundle and do not add a runtime request; shared dependencies are still bundled once. Use dynamic imports only at a coarse platform boundary where avoiding a substantial unused platform tree outweighs another chunk request. When a dynamic split is justified, start loading the selected module immediately in parallel with its data request rather than waiting to render the lazy component.

## Internationalization

Every user-facing string ships through Lingui macros, so never write bare English into markup. Wrap visible text in `<Trans>` from `@lingui/react/macro`, and build string attributes such as `aria-label`, `placeholder`, `title`, and `alt` from the `t` tagged template returned by `useLingui()`. Because macros extract the source text itself as the message, there are no key names to invent or keep in sync.

Two rules are absolute. Never call `t` at module scope: it resolves immediately, freezing the source-locale string so it never reacts to a locale switch. Module-level label lists—nav tabs, sort options, enum-to-label maps—must instead hold `msg` descriptors from `@lingui/core/macro` and be resolved during render with `i18n._(descriptor)`. And never concatenate or split a sentence across elements or expressions; one `<Trans>` wraps a whole sentence even when it contains inline markup, because word order and grammar differ per language.

Anything that varies with a count belongs in `<Plural>`, never a ternary on the number, since target locales have plural categories the source locale lacks—Russian needs `one`, `few`, `many`, and `other`. When the interpolated value is an expression rather than a plain identifier, name it with the `ph` macro so translators see `{albumCount}` instead of `{0}`. Add `context` to short ambiguous words so the same source word can be translated differently per site, and `comment` wherever a translator would otherwise be guessing.

All locale-sensitive formatting lives in `src/i18n/formats.ts` and is reached through `useFormatters()` from `@/i18n`, which exposes `score`, `integer`, `relativeTime`, `date`, and `duration`. Calling `.toFixed()`, `.toLocaleString()`, or `.toLocaleDateString()` anywhere else is a defect; construct `Intl` objects only inside that module, where they are memoized per locale. Score band words come from `useScoreWord()` in `src/lib/score.ts`, which keeps the threshold ladder separate from its labels.

## npm registry

Always use the public npm registry declared in the committed `.npmrc`: `https://registry.npmjs.org/`. Do not remove that file or fall back to the developer's global Yandex npm registry.

Run `nvm use` before npm commands so the project uses the Node version pinned in `.nvmrc`.

TypeScript stays on the latest 5.x release because the latest `openapi-typescript` currently declares a `typescript@^5.x` peer dependency. Do not bypass this constraint with `--force` or `--legacy-peer-deps`; upgrade both together when the generator adds TypeScript 7 support.

## OpenAPI types

All the logic should live on the backend. We strive to keep our components slim and with almost no logic, feel free to ask extra backend work, if you start implementing something that does not belong on the front end.

`openapi/api.yaml` is the source of truth for API types. Run `npm run gen:api` after contract changes and commit `src/api/generated/schema.ts`. Never edit the generated file manually.

## Formatting

Run `npm run prettier` to format project files using `.prettierrc.cjs`.

## Tests

Use Vitest and React Testing Library for units, hooks, and component behavior. Use Playwright Test only for complete user journeys, real browser behavior, and deliberate visual-regression checkpoints. Tests should survive refactors.

Prefer accessible queries and user-observable behavior. Use `userEvent.setup()` with awaited interactions in component tests. Do not add test IDs where a role, label, or visible name can identify the element.

Screenshot baseline changes require human review. Never update or accept visual baselines automatically in CI.

## Driving the app

`.mcp.json` registers Playwright MCP, opened at a 390×844 touch viewport to match the mobile-first default. Use it to drive `npm run dev` and see a change working before asking for review. Its accessibility snapshots name elements by role, so what you explore converts directly into the `getByRole` locators the tests use. It is an exploration tool: committed baselines under `tests/e2e` remain the record of how a surface looks.
