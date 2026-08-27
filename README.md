# Redbrick IT Onboarding Resources

Internal page where new employees pick up their email signature generator,
desktop wallpapers, and account icons. Built from the
[Figma design](https://www.figma.com/design/REHRfjapz1aMK5OIBgt0Mi/Redbrick-IT-Projects?node-id=390-499&m=dev),
with the page's content managed in a CMS so links and files can change without
a deploy.

**One app, one deploy.** Payload runs inside the Next.js app rather than as a
separate server, so the admin panel is at `/admin` in the same project and the
whole thing ships to Vercel on its own.

## Stack

| Piece      | Version  | Notes                                                                  |
| ---------- | -------- | ---------------------------------------------------------------------- |
| Next.js    | 16.3.3   | App Router, Turbopack, React Server Components                         |
| React      | 19.2.8   |                                                                        |
| TypeScript | 7.0.2    | The native (Go) compiler — see [Known constraints](#known-constraints) |
| Payload    | 3.88.0   | Mounted into the App Router at `/admin`                                |
| Database   | Postgres | Neon in production, a Docker container locally                         |

Styling is plain CSS Modules with design tokens in
[`app/(frontend)/globals.css`](<app/(frontend)/globals.css>) — no
Tailwind, matching `rdbrckit-equipment-marketplace`.

## Layout

```
app/(frontend)/     the public page
app/(payload)/      the admin panel and Payload's API  (Payload owns these)
collections/        the content model
components/         UI — none of it is CMS-aware
lib/                CMS reads and shared types
migrations/         database schema history
payload.config.ts
```

## Run it locally

```bash
docker compose up -d

npm install
cp .env.local.example .env.local   # then set PAYLOAD_SECRET
npm run payload:migrate
npm run seed
npm run dev
```

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> — create your user on first visit

The seed fills in the sections, groups, and button labels from the design. It
refuses to run if any content already exists, so it can't clobber your edits.
If the database is empty or unreachable the page falls back to the design's own
copy rather than rendering blank.

> Postgres runs on **5434**, not 5432 — your `rustdesk-portal` and
> `sf-signature` containers already have 5432 and 5433.

---

## What I need you to do

Steps 1–4 get it live. Everything is one Vercel project.

### 1. Create the Neon database

In Vercel: **Storage → Create Database → Neon**. Open it and copy the
**pooled** connection string — the host contains `-pooler`, which matters
because serverless functions open and drop connections constantly and the
pooler is what keeps that from exhausting Neon's connection limit.

```
postgresql://USER:PASSWORD@ep-xxxx-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Create a Blob store for uploads

In Vercel: **Storage → Create → Blob**. Creating it sets
`BLOB_READ_WRITE_TOKEN` on the project automatically.

This isn't optional. Vercel's filesystem is read-only apart from an ephemeral
`/tmp`, so without Blob the wallpapers and icons have nowhere to go. Payload
only activates the Blob plugin when that token is present, which is why local
development still writes to disk with no setup.

### 3. Set the environment variables

On the Vercel project:

```bash
DATABASE_URI=<the Neon pooled connection string from step 1>
PAYLOAD_SECRET=<openssl rand -base64 32>
# BLOB_READ_WRITE_TOKEN is set for you by step 2
```

### 4. Deploy

Point Vercel at this repo. The app is at the repository root, so leave the
root directory setting empty.

Set the build command to run migrations first:

```bash
npm run payload:migrate && npm run build
```

Payload refuses to push schema changes in production — that's deliberate, so a
deploy can never silently alter the database. `migrations/` is the schema
history, and the initial migration creates all twelve tables.

> **If a deploy ever seems to skip migrations, this is why.** Running the app in
> dev mode against a database writes a `dev` marker row (batch `-1`) into
> `payload_migrations`, because dev mode pushes schema changes directly. On any
> later `payload migrate`, Payload prompts before continuing — and with no TTY
> the prompt resolves to its default of "no" and exits 0. The build then passes
> having applied nothing. `npm run payload:migrate:status` shows the marker; a
> production database only ever touched by migrations never gets one.
>
> `npm run payload:migrate:force` skips the prompt. Be deliberate about it: the
> prompt exists because reconciling dev-pushed schema with migrations can drop
> data.

Then open `https://<your-site>/admin` and create the first admin user.

### 5. Fill in the content

The seeded buttons have labels but no destinations, and render as inert pills
until you give them one. In **Resource Sections**, each link takes either:

- **File** — upload the wallpaper or icon; the button becomes a download, or
- **URL** — for the signature generators, which link out.

Publishing repaints the page immediately — an `afterChange` hook calls
`revalidatePath` directly. No webhook to configure.

Two deliberate details, in case they look like oversights:

- **The Figma design lists "Delivra" twice** under Account Icons, once per row.
  That was a typo — the second one is **Duplex**, and the seed reflects that.
  The design file itself still says Delivra.
- **"Submit a Ticket"** in the header is intentionally unlinked, matching the
  marketplace site. It renders as an inert pill. To wire it up, swap the
  `<span>` for an `<a>` in [`components/Header.tsx`](components/Header.tsx) —
  there are two, one for desktop and one for the mobile menu.

---

## Content model

```
Resource Section
├── title    e.g. "Email Signatures"      -> section heading
├── order                                 -> sort order on the page
└── groups[]
    ├── label  e.g. "Wallpapers"          -> the small-caps label
    ├── note   optional                   -> italic text above the label
    └── links[]
        ├── label  e.g. "Animoto"         -> the button text
        ├── file   optional upload        -> downloads; wins over url
        └── url    optional               -> opens in a new tab
```

Adding a section or group in the admin adds it to the page. No code change.

Changing this model means generating a migration:

```bash
npm run payload:migrate:create
```

## How the design maps to code

Worth knowing if you compare the code to the Figma file side by side:

- **The button grid isn't hard-coded.** A button is 304px with a 32px gutter,
  which packs exactly four across the 1312px content box. The 4-then-3 wrap
  under Account Icons falls out of the grid track sizing, so adding an eighth
  icon in the CMS wraps correctly on its own.
- **The hero is 540px, not 620px.** Figma floats the header over the hero and
  reserves 80px of top padding for it. Here the header sits in normal flow and
  the hero takes the remaining 540px — same rendered result, simpler layout.
- **Button states use an inset shadow, not a border.** Figma draws the hover
  and pressed strokes as inside strokes. A real 2px border would grow the pill
  by 4px and shift the whole grid on every hover.
- **Dividers are backgrounds, not images.** All three rules in the design export
  as 2px white SVG strokes, so they're plain CSS.
- **Logos and social icons are the real vectors** from the Figma file, carried
  over from `rdbrckit-equipment-marketplace`. The Redbrick badge and wordmark
  are SVG, despite looking raster in the design. Each social glyph keeps its own
  dimensions — LinkedIn is 16 × 15.635, not square.

`Header`, `Footer`, and `SocialIcons` are ported from the marketplace site, so
the scroll-hide bar, the hamburger-to-X mobile menu, and the nav hover rings
behave identically across both properties.

## Known constraints

**TypeScript 7 and ESLint.** TypeScript 7.0.2 is the native Go compiler, and
`typescript-eslint` doesn't support it yet — it throws at import time on
`major >= 7` ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).
Microsoft's documented workaround is running TypeScript 6 side by side, but
that isn't expressible here: `typescript` is a _peerOptional_ of
`eslint-config-next`, so npm always resolves it to the root copy.

So [`eslint.config.mjs`](eslint.config.mjs) assembles the same plugin
set `eslint-config-next` uses (Next.js, React, React Hooks, jsx-a11y) and parses
with Next's own Babel-based parser, which reads TypeScript syntax without
touching the TS compiler API. Everything except the type-aware lint rules still
runs.

Type correctness is unaffected — `npm run typecheck` (tsc 7) and the type check
`next build` runs both cover it. When typescript-eslint ships TS 7 support, that
file can go back to a two-line `eslint-config-next` extend.

**Why not `@payloadcms/db-vercel-postgres`.** It's built on `@vercel/postgres`,
which is deprecated: Vercel Postgres migrated to Neon as a native integration,
which is the database this points at anyway. `@payloadcms/db-postgres` against
Neon's pooled endpoint is the current path.

**Payload owns `app/(payload)/`.** Those files are generated scaffolding.
`importMap.js` and `payload-types.ts` are regenerated by
`npm run payload:importmap` and `npm run payload:types` — don't hand-edit them.

## Scripts

Run from the repository root:

| Command                          | Does                                      |
| -------------------------------- | ----------------------------------------- |
| `npm run dev`                    | Dev server on :3000                       |
| `npm run build`                  | Production build (includes typecheck)     |
| `npm run typecheck`              | `tsc --noEmit` with TypeScript 7          |
| `npm run lint`                   | ESLint                                    |
| `npm run format`                 | Prettier                                  |
| `npm run seed`                   | Populate an empty CMS from the design     |
| `npm run payload:migrate`        | Apply pending migrations                  |
| `npm run payload:migrate:status` | List migrations and whether they ran      |
| `npm run payload:migrate:force`  | Apply migrations, skipping the dev prompt |
| `npm run payload:migrate:create` | Generate a migration after a model change |
| `npm run payload:types`          | Regenerate `payload-types.ts`             |
| `npm run payload:importmap`      | Regenerate the admin import map           |
