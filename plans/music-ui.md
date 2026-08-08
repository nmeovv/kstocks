# Music UI: surfaces, contract requests, and build order

Two agents work from this file:

- a **backend agent** in the sibling backend repository, who owns part 2;
- a **frontend agent** in this repository, who owns part 3.

Part 1 is shared reference both parts read.

The frontend is rebuilt from the backend contract, not migrated from what exists.
`openapi/api.yaml` in this repository is a mirror of the backend's contract: the
backend agent changes it there, the frontend agent regenerates types from it here.

---

## Part 1: Surfaces

Eight routes. Every layout below is the touch layout; wider layouts follow
`AGENTS.md` and add nothing to the field list.

Field tables name the endpoint each value comes from. A field marked **(request)**
does not exist yet and is specified in part 2.

### `/` — Feed

```
┌────────────────────────────┐
│  Naevis                    │
│                            │
│  Significant releases      │
│  ┌──────┐ ┌──────┐ ┌────── │
│  │ art  │ │ art  │ │ art   │  ← horizontal scroll
│  │ work │ │ work │ │ work  │
│  └──────┘ └──────┘ └────── │
│   Name     Name     Name   │
│   Artist   Artist   Artist │
│                            │
│  Latest ratings            │
│  ┌────────────────────────┐│
│  │ ◉ Maya Chen        9.4 ││
│  │   Blue Rev             ││
│  │   Alvvays · 2 days ago ││
│  └────────────────────────┘│
│  ┌────────────────────────┐│
│  │ ◉ Theo Martin      9.1 ││
│  └────────────────────────┘│
│         … cursor page …    │
└────────────────────────────┘
```

Two independent sections, stacked. The strip is short and rarely changes; the
ratings list is long and pages.

| Value | Source |
| --- | --- |
| significant release name, artist line, cover | `GET /music/releases/significant` **(request)** |
| rater display name, score, rated-at, release name and artist | `GET /feed/ratings` **(request)** |

### `/music/releases` — Release calendar

Reached by the **Releases** nav item. This is the music landing surface.

```
┌────────────────────────────┐
│  Releases                  │
│                            │
│  [ Girl group ][ Boy group]│  ← filter chips, both off = all
│                            │
│  ┌────────────────────────┐│
│  │ ▪▪▫▪▫▫▪▪▫▪▪▫▪▫▪▪▫▪▫▪▫▫ ││  ← 53 weeks, horizontal scroll
│  │ ▫▪▪▫▪▪▫▫▪▫▫▪▪▫▫▪▪▫▪▫▪▪ ││
│  └────────────────────────┘│
│   Jan   Apr   Jul   Oct    │
│                            │
│  Latest releases           │
│  ┌────────────────────────┐│
│  │ ▢ Release name         ││
│  │   Artist · 12 Aug      ││
│  └────────────────────────┘│
└────────────────────────────┘
```

Cell colour is the release count for that day. Tapping a cell filters the list
below to that date; tapping it again clears. Filter chips apply to both the
heatmap and the list.

The grid scrolls horizontally on touch, as GitHub's activity heatmap does. A
release schedule is activity.

| Value | Source |
| --- | --- |
| per-day release counts | `GET /music/releases/calendar` **(request)** |
| latest releases, filtered by date and group category | `GET /music/releases` **(request: filter params)** |
| filter chip labels | static |

### `/music/artists` — Artist directory

```
┌────────────────────────────┐
│  Artists                   │
│  ┌────────────────────────┐│
│  │ 🔍 Search artists      ││
│  └────────────────────────┘│
│  ┌────────────────────────┐│
│  │ (I)  IVE               ││
│  ├────────────────────────┤│
│  │ (T)  tripleS           ││
│  ├────────────────────────┤│
│  │ (A)  Acid Angel from…  ││
│  └────────────────────────┘│
│         … cursor page …    │
└────────────────────────────┘
```

Browse-first: the list is populated before anyone types. Search narrows it
**on the server**, so an alias or a native-script name matches. The client sends
the query and renders the response.

| Value | Source |
| --- | --- |
| artist id, name | `GET /music/artists` **(request: `query`, pagination)** |

`kind` is not rendered.

### `/music/artists/:performingEntityId` — One artist

```
┌────────────────────────────┐
│  ← IVE                     │
│                            │
│  ┌────────────────────────┐│
│  │ ▢ Release name         ││
│  │   Album · 2024         ││
│  └────────────────────────┘│
└────────────────────────────┘
```

The id is a path segment because `performingEntityId` is required by the
releases endpoint. An unknown id renders not-found; it never falls back to
another artist.

| Value | Source |
| --- | --- |
| artist name | `GET /music/artists/{id}` **(request)** |
| releases | `GET /music/releases?performingEntityId=` (exists) |

### `/music/releases/:releaseId` — Release detail

```
┌────────────────────────────┐
│  ←                         │
│      ┌──────────────┐      │
│      │   artwork    │      │
│      └──────────────┘      │
│  Release name              │
│  IVE · LE SSERAFIM         │  ← performingEntities, each tappable
│  Album · 12 Aug 2024       │
│  ▸ Credits                 │  ← discloses artistCredits
│                            │
│  ★ 8  ·  42 voters         │
│                            │
│  1. Track title       ★ 9  │
│  2. Track title       ★ 7  │
└────────────────────────────┘
```

The artist line is `performingEntities`, each entry linking to
`/music/artists/:id`. `artistCredits` is the free text printed on the release and
appears only when the user opens Credits. When `performingEntities` is empty the
artist line falls back to `artistCredits`.

| Value | Source |
| --- | --- |
| release, images, tracks, performingEntities | `GET /music/releases/{releaseId}` (exists) |
| aggregate and own score | `GET /releases/{id}/rating`, `GET /tracks/{id}/rating` (exists) |
| voters | `GET /releases/{id}/voters` (exists) |
| rating writes | `PUT`/`DELETE` on the rating paths (exists) |

### `/music/releases/new` — Upload

Spotify URL → preview → editable draft → submit. The draft form gains an artist
picker writing `performingEntityIds`; without it an uploaded release links to no
artist and cannot be reached from any list.

| Value | Source |
| --- | --- |
| prefilled draft | `POST /music/releases/spotify/preview` (exists) |
| artist picker options | `GET /music/artists` (exists) |
| submit | `POST /music/releases` **(request: `performingEntityIds`)** |

### `/music/my-ratings` and `/music/charts`

Rebuilt against endpoints that already exist and need no contract change:
`GET /music/users/me/ratings`, `GET /music/rated/releases`,
`GET /music/rated/tracks?criterion=`.

### Navigation

Touch bottom nav carries four items: **Feed** (`/`), **Releases**
(`/music/releases`), **Artists** (`/music/artists`), **My ratings**
(`/music/my-ratings`). Charts is reached from within Releases.

---

## Part 2: Contract requests (backend agent)

Six changes. Each states what the UI cannot render without it. Apply them to
`openapi/api.yaml` in the backend repository together with the implementation.

The YAML below is a proposal in the UI's terms. Rename fields to match backend
conventions where they clash, and say so in the handoff; the frontend follows the
contract, not this file.

### 2.1 Link a release to its artists on upload

`MusicReleaseDraft` carries `artistCredits` (free text) but nothing that creates a
`music.release_performing_entities` row. `GET /music/releases` requires
`performingEntityId`, so a release uploaded through the UI is unreachable.

The catalog plan is explicit that this association is user-managed and never
inferred from text credits, so it has to arrive from the client.

```yaml
MusicReleaseDraft:
  properties:
    performingEntityIds:
      type: array
      items:
        type: string
        format: uuid
```

Empty array is valid: it means the uploader chose no artist.

### 2.2 Search and paginate the artist directory

`GET /api/v1/music/artists` returns every performing entity with an active
release, unfiltered and unpaged.

Name matching belongs on the server: `catalog.names` holds aliases,
romanizations, and native-script forms with a normalized `search_key`, and the
client sees only one display name per artist. A client-side substring filter
cannot match `아이브` against `IVE`.

```yaml
/api/v1/music/artists:
  get:
    parameters:
      - name: query
        in: query
        schema: {type: string}
      - name: cursor
        in: query
        schema: {type: string}
      - name: limit
        in: query
        schema: {type: integer, minimum: 1, maximum: 100, default: 50}
```

Response becomes a page object: `{items: MusicArtistSummary[], nextCursor: string|null}`.

An absent `query` returns the browse listing; the directory is populated before
the user types.

### 2.3 Read one artist by id

`/music/artists/:performingEntityId` shows the artist's name in its header and
must distinguish an unknown id from an artist with no releases. Today the only
way to learn a name is to fetch the whole directory and search it client-side.

```yaml
/api/v1/music/artists/{performingEntityId}:
  get:
    parameters:
      - name: performingEntityId
        in: path
        required: true
        schema: {type: string, format: uuid}
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MusicArtistSummary'
      '404':
        description: Performing entity not found
```

### 2.4 Group category on the performing entity

`/music/releases` carries two filter chips. The category is an attribute of the
act, set by a moderator. Add a column to `catalog.performing_entities` holding
`girl_group | boy_group | mixed`, nullable, where null means uncategorized.

It is a stored attribute, not a value derived from members, so it stays stable
when a lineup changes.

The UI never displays this value, so it stays off `MusicArtistSummary` and
appears only as a query parameter on the release listing (2.6) and the calendar
(2.7).

### 2.4b Artist links on the release summary

`MusicReleaseSummary` carries `artistCredits` (free text) but no catalog link, so
every list surface must join that array into a display string and none of them
can link a release to its artists. The detail rule — show `performingEntities`,
fall back to `artistCredits` — is unimplementable on a list.

```yaml
MusicReleaseSummary:
  properties:
    performingEntities:
      type: array
      items:
        $ref: '#/components/schemas/MusicArtistSummary'
```

Every surface then renders the artist line the same way from the same field.

Same gap on `MusicRatedTarget`, which the charts page renders: it carries
`{id, name, voterCount, average}` with no cover and no artist, so the client
either shows a bare list or fetches each release separately. Give it the cover
and the artist link too.

### 2.5 Significant releases

An administrator marks a release significant. Marking happens through direct
database manipulation, so the field is **read-only** over HTTP and the contract
needs no role, no session flag, and no write endpoint.

```yaml
MusicReleaseSummary:
  properties:
    significant:
      type: boolean
```

```yaml
/api/v1/music/releases/significant:
  get:
    responses:
      '200':
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/MusicReleaseSummary'
```

### 2.6 Release listing: latest, by date, by category

`GET /api/v1/music/releases` requires `performingEntityId`. The calendar page
lists releases across all artists, optionally narrowed to one day and one group
category.

Make `performingEntityId` optional and add:

```yaml
/api/v1/music/releases:
  get:
    parameters:
      - name: performingEntityId
        in: query
        schema: {type: string, format: uuid}
      - name: releasedOn
        in: query
        schema: {type: string, format: date}
      - name: groupCategory
        in: query
        schema:
          type: string
          enum: [girl_group, boy_group, mixed]
      - name: cursor
        in: query
        schema: {type: string}
      - name: limit
        in: query
        schema: {type: integer, minimum: 1, maximum: 100, default: 50}
```

With no parameters it returns the latest releases, newest first. Response becomes
a page object as in 2.2. `groupCategory` matches a release whose linked
performing entities include one with that category.

### 2.7 Release calendar counts

The heatmap needs one cell per day over a window. Return **every** day in the
window including empty ones, each carrying its own intensity `level`, so the
client maps level to a CSS class and renders the array in order. Filling gaps and
bucketing counts into intensities are decisions about the data's distribution and
belong with the data.

```yaml
/api/v1/music/releases/calendar:
  get:
    parameters:
      - name: from
        in: query
        schema: {type: string, format: date}
      - name: to
        in: query
        schema: {type: string, format: date}
      - name: groupCategory
        in: query
        schema:
          type: string
          enum: [girl_group, boy_group, mixed]
    responses:
      '200':
        content:
          application/json:
            schema:
              type: object
              required: [from, to, days]
              properties:
                from: {type: string, format: date}
                to: {type: string, format: date}
                days:
                  type: array
                  items:
                    type: object
                    required: [date, count, level]
                    properties:
                      date: {type: string, format: date}
                      count: {type: integer, minimum: 0}
                      level:
                        type: integer
                        minimum: 0
                        maximum: 4
```

Omitting `from` and `to` returns the last twelve months, so the page's first load
sends no parameters. The echoed `from`/`to` let the client label the axis without
recomputing the window.

### 2.8 Ratings feed

`FeedResponse`, `FeedItem`, and `AlbumSummary` are unreachable: no path
references them, string ids do not match `music.releases`, and `artwork` is an
enum of three decorative placeholders. Delete all three and replace with a feed
built on the real music model:

```yaml
/api/v1/feed/ratings:
  get:
    parameters:
      - name: cursor
        in: query
        schema: {type: string}
      - name: limit
        in: query
        schema: {type: integer, minimum: 1, maximum: 100, default: 20}
    responses:
      '200':
        content:
          application/json:
            schema:
              type: object
              required: [items, nextCursor]
              properties:
                items:
                  type: array
                  items:
                    $ref: '#/components/schemas/FeedRatingItem'
                nextCursor:
                  type: string
                  nullable: true

FeedRatingItem:
  type: object
  additionalProperties: false
  required: [id, user, release, score, ratedAt]
  properties:
    id: {type: string}
    user:
      $ref: '#/components/schemas/FeedUser'
    release:
      $ref: '#/components/schemas/MusicReleaseSummary'
    score: {type: integer, minimum: 0, maximum: 10}
    strength:
      type: string
      nullable: true
      enum: [weak, decent, strong]
    ratedAt: {type: string, format: date-time}

FeedUser:
  type: object
  additionalProperties: false
  required: [id, displayName]
  properties:
    id: {type: integer, format: int64}
    displayName: {type: string, minLength: 1}
    avatarUrl: {type: string, format: uri, nullable: true}
```

`displayName` is composed on the server and is never blank. Reusing
`AuthenticatedUser` here would hand the client a nullable `username`,
`firstName`, and `lastName` and make it decide what to call a person — a rule
that then has to stay identical everywhere a name appears.

Release ratings only; track ratings stay off the feed.

### Done when

- every item 2.1 through 2.8 is either implemented or answered with a rejection
  and its reason;
- `openapi/api.yaml` in the backend repository reflects each implemented item;
- the backend's own test bar in `plans/catalog-selca-ingestion.md` §13 covers the
  new endpoints;
- the handoff names any field renamed away from this proposal.

A contradiction with the catalog plan gets surfaced with the affected invariant,
per that plan's closing rule, rather than resolved by widening scope.

---

## Part 3: Build order (frontend agent)

Build each surface only once its endpoints exist. Delete the old
implementation of a surface as the first move of its own step, so the mock never
outlives the thing that replaces it and never sits in the repository as an
example to copy.

Keep across every step: `src/features/music/styles/`, `src/components/ui`, and
the global styles. The visual language in `AGENTS.md` survives the contract
change.

Each step regenerates types first: `npm run gen:api` after copying the backend's
`openapi/api.yaml`, and the generated file is committed.

1. **Release detail** (`2.1` not required). Delete `release-detail/`.
2. **Artist directory and artist page** (needs `2.2`, `2.3`). Delete
   `release-list/`.
3. **Release calendar** (needs `2.4`, `2.6`, `2.7`).
4. **Feed** (needs `2.5`, `2.8`). Delete `src/features/feed/`, `src/api/feed.ts`,
   and `src/api/mock-feed.ts`.
5. **My ratings and charts** (no contract change). Delete `my-ratings/` and
   `charts/`.
6. **Upload** (needs `2.1`). Delete `release-upload/`.

`src/api/music.ts` is rewritten across steps 1 and 2 and carries no group or idol
concept.

Delete `src/features/music/fixtures.ts`, `music.stories.tsx`, and each e2e spec
with its baseline PNGs alongside the step that removes the surface they cover.

### Naming

`PerformingEntity` in code: types, hooks, route params, query keys. **Artist** in
every user-facing string, as Spotify does. `artistCredits` keeps its wire name and
stays a distinct concept from the catalog link.

### Tests per step

- **Vitest**: route-param parsing and rejection of a malformed id; each page's
  state as a pure function over its query results; a runtime guard that rejects a
  response carrying a retired shape rather than rendering it.
- **Playwright**: one journey — pick an artist, open a release, rate it — at the
  touch viewport.
- **Screenshots**: touch baselines for the surface built in that step. New
  baselines go to the user in one batch per step for review.
