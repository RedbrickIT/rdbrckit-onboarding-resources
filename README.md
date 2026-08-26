# Redbrick IT Onboarding Resources

Internal page where new employees pick up their email signature generator,
desktop wallpapers, and account icons. Built from the
[Figma design](https://www.figma.com/design/REHRfjapz1aMK5OIBgt0Mi/Redbrick-IT-Projects?node-id=390-499&m=dev),
with all of the page's content managed in Strapi so the links and files can be
changed without a deploy.

## Stack

| Piece    | Version  | Notes                                              |
| -------- | -------- | -------------------------------------------------- |
| Next.js  | 16.3.3   | App Router, Turbopack, React Server Components      |
| React    | 19.2.8   |                                                     |
| TypeScript | 7.0.2  | The native (Go) compiler — see [Known constraints](#known-constraints) |
| Strapi   | 5.52.2   | TypeScript, headless CMS                            |
| Database | Postgres | Neon in production, SQLite locally                  |

Styling is plain CSS Modules with design tokens in
[`web/app/globals.css`](web/app/globals.css) — no Tailwind, matching the
approach used in `rdbrckit-equipment-marketplace`.

## Repo layout

```
web/    Next.js front end  -> deploys to Vercel
cms/    Strapi CMS         -> deploys to Railway / Render / Strapi Cloud
```

## Run it locally

Two terminals. The CMS runs on SQLite locally, so there is nothing to install
or configure for the database.

```bash
cd cms && npm install && npm run develop
```

```bash
cd web && npm install && cp .env.local.example .env.local && npm run dev
```

- Site: <http://localhost:3000>
- Strapi admin: <http://localhost:1337/admin>

On its first boot against an empty database, Strapi seeds the sections, groups,
and button labels from the design, and grants the Public role read access to
them — so the site renders real CMS content immediately, with no clicking
required. Both steps are idempotent and never overwrite content you have
edited.

If Strapi is not running, the front end falls back to the design's own copy
rather than rendering an empty page.

---

## What I need you to do

Everything below is account/credential work I can't do from here. Steps 1–4 get
it live; 5 is optional.

### 1. Heads up: Strapi cannot run on Vercel

This is the one place the original plan needs to change. Vercel runs serverless
functions with a read-only filesystem and no long-lived process. Strapi is a
persistent Node server with an admin panel, a bootstrap phase, and an uploads
directory. It will not run there.

**Neon is still exactly right** — it's the database both halves point at. Only
the Strapi *app* needs a different home:

| Component | Host                                       |
| --------- | ------------------------------------------ |
| Next.js   | Vercel                                     |
| Strapi    | Railway, Render, Fly.io, or Strapi Cloud   |
| Postgres  | Neon (via the Vercel Marketplace, as planned) |

Railway is the least fiddly of those — it gives you a persistent volume, which
matters for step 3.

### 2. Create the Neon database

In Vercel: **Storage → Create Database → Neon**. Once it's provisioned, open it
and copy the **pooled** connection string (the host contains `-pooler`). It
looks like:

```
postgresql://USER:PASSWORD@ep-xxxx-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require
```

You'll paste this into the Strapi host in the next step, not into Vercel —
Vercel's Next.js app never talks to Postgres directly, only to Strapi's API.

### 3. Deploy Strapi

Point your host at this repo with **root directory `cms`**, then set:

```bash
DATABASE_CLIENT=postgres
DATABASE_URL=<the Neon pooled connection string from step 2>
DATABASE_SSL=true

PUBLIC_URL=https://<your-strapi-host>

# Generate each of these separately with: openssl rand -base64 32
APP_KEYS=<key1>,<key2>
API_TOKEN_SALT=<value>
ADMIN_JWT_SECRET=<value>
TRANSFER_TOKEN_SALT=<value>
JWT_SECRET=<value>
ENCRYPTION_KEY=<value>
```

> **Attach a persistent volume mounted at `cms/public/uploads`.** Wallpapers and
> account icons uploaded through the admin are written to disk. On an ephemeral
> filesystem (Render's free tier, Railway without a volume) every redeploy
> silently deletes them. The alternative is an upload provider —
> `@strapi/provider-upload-aws-s3` or Cloudinary — which is the better long-term
> answer if these files matter.

Then open `https://<your-strapi-host>/admin` and create the first admin user.

### 4. Deploy the front end to Vercel

New Vercel project on this repo with **root directory `web`**, then set:

```bash
STRAPI_URL=https://<your-strapi-host>
```

That's the only required variable. `STRAPI_API_TOKEN` is optional — see
[Locking down the API](#locking-down-the-api).

### 5. Optional: instant updates on publish

By default the site picks up CMS changes within 60 seconds. To make publishing
instant:

1. Set `REVALIDATE_SECRET` on the Vercel project (`openssl rand -hex 32`).
2. In Strapi: **Settings → Webhooks → Create new webhook**
   - URL: `https://<your-site>/api/revalidate`
   - Header: `Authorization: Bearer <the same secret>`
   - Events: Entry publish / unpublish / update / delete

The endpoint returns 404 while `REVALIDATE_SECRET` is unset, so leaving it off
doesn't expose anything.

### 6. Fill in the content

The seeded buttons have labels but no destinations, and render as inert pills
until you give them one. In **Content Manager → Resource Section**, each link
takes either:

- **File** — upload the wallpaper or icon; the button becomes a download, or
- **URL** — for the signature generators, which link out.

Two things worth a look while you're in there:

- **"Delivra" appears twice** under Account Icons. That's how it's drawn in the
  Figma file (once per row), so I reproduced it rather than silently
  second-guessing it. If it's a typo, delete one.
- **"Submit a Ticket"** in the header is unlinked, matching the marketplace
  site. Send me the helpdesk URL and I'll wire it up.

---

## Content model

```
Resource Section  (collection type)
├── title    e.g. "Email Signatures"      -> section heading
├── order    integer                      -> sort order on the page
└── groups   repeatable component
    ├── label  e.g. "Wallpapers"          -> the small-caps label
    ├── note   optional                   -> italic text above the label
    └── links  repeatable component
        ├── label  e.g. "Animoto"         -> the button text
        ├── url    optional               -> opens in a new tab
        └── file   optional media         -> downloads; wins over url
```

Adding a section or group in the admin adds it to the page. Nothing needs a
code change.

## How the design maps to code

A few decisions worth knowing about if you compare the code to the Figma file
side by side:

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
  are SVG, despite looking raster in the design.

`Header`, `Footer`, and `SocialIcons` are ported from the marketplace site, so
the scroll-hide bar, the hamburger-to-X mobile menu, and the nav hover rings
behave identically across both properties.

## Locking down the API

The page content is public, so on first boot Strapi grants the Public role
`find` and `findOne` on `resource-section` — and nothing else. Every other
content type and every write action stays closed.

To require authentication instead:

1. Set `STRAPI_SKIP_PUBLIC_READ=true` on the Strapi host.
2. Revoke those two permissions in **Settings → Roles → Public**.
3. Create a **Read-only** token in **Settings → API Tokens** and set it as
   `STRAPI_API_TOKEN` on the Vercel project.

The front end already supports both; it sends the token whenever one is set.

## Known constraints

**TypeScript 7 and ESLint.** TypeScript 7.0.2 is the native Go compiler, and
`typescript-eslint` doesn't support it yet — it throws at import time on
`major >= 7` ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).
Microsoft's documented workaround is running TypeScript 6 side by side, but
that isn't expressible here: `typescript` is a *peerOptional* of
`eslint-config-next`, so npm always resolves it to the root copy.

So [`web/eslint.config.mjs`](web/eslint.config.mjs) assembles the same plugin
set `eslint-config-next` uses (Next.js, React, React Hooks, jsx-a11y) and parses
with Next's own Babel-based parser, which reads TypeScript syntax without
touching the TS compiler API. Everything except the type-aware lint rules still
runs.

Type correctness is unaffected — it's covered by `npm run typecheck` (tsc 7) and
by the type check `next build` runs. When typescript-eslint ships TS 7 support,
that file can go back to a two-line `eslint-config-next` extend.

**SQLite locally, Postgres in production.** Convenient, but they aren't the same
database. If you add anything schema-heavy later, test it against Neon before
shipping.

## Scripts

In `web/`:

| Command             | Does                                  |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server on :3000                   |
| `npm run build`     | Production build (includes typecheck) |
| `npm run typecheck` | `tsc --noEmit` with TypeScript 7      |
| `npm run lint`      | ESLint                                |
| `npm run format`    | Prettier                              |

In `cms/`:

| Command             | Does                              |
| ------------------- | --------------------------------- |
| `npm run develop`   | Strapi with hot reload on :1337   |
| `npm run build`     | Build the admin panel             |
| `npm run start`     | Production server                 |
