import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { ResourceSections } from "./collections/ResourceSections";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The shape a Vercel Blob read-write token has to have.
 *
 * The storage plugin parses the store id out of the token with this same
 * pattern and throws if it can't, so checking it here lets us fail with an
 * error that says what is actually wrong.
 */
const BLOB_TOKEN_PATTERN = /^vercel_blob_rw_[a-z\d]+_[a-z\d]+$/i;

/**
 * Resolve the Blob read-write token, tolerating how it tends to arrive.
 *
 * Blob storage is only wired up when a token is present. Vercel's filesystem
 * is read-only apart from an ephemeral /tmp, so uploads must go to Blob in
 * production. Locally there is no token and Payload writes to ./public/media
 * instead, which keeps development zero-config.
 *
 * Values pasted into a dashboard field routinely pick up a trailing newline or
 * a pair of quotes, and the plugin rejects the token outright when they do —
 * with a message that names the expected format but not what it actually got.
 * So trim the value, and if it still doesn't parse, report its shape with every
 * letter and digit masked. That is safe to print in a build log and it says
 * precisely what went wrong.
 */
function blobToken(): string | undefined {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;

  if (!raw) {
    return undefined;
  }

  const token = raw.trim().replace(/^["']|["']$/g, "");

  if (!token) {
    return undefined;
  }

  if (!BLOB_TOKEN_PATTERN.test(token)) {
    const shape = token
      .replace(/[a-z]/g, "a")
      .replace(/[A-Z]/g, "A")
      .replace(/\d/g, "9");

    throw new Error(
      "BLOB_READ_WRITE_TOKEN is set but is not a Vercel Blob read-write " +
        "token. Expected vercel_blob_rw_<store_id>_<random_string>. Got " +
        `${token.length} characters shaped like ${shape} (letters masked as ` +
        "a/A, digits as 9). Check for a stray character, or that the value " +
        "isn't a store id or webhook key.",
    );
  }

  return token;
}

/**
 * Resolve the Postgres connection string.
 *
 * DATABASE_URI is what this project sets locally. The other two are what
 * Vercel's Neon integration injects when a database is linked to the project,
 * so accepting them means the deploy works off the linked store without
 * anyone hand-copying a connection string into a second variable.
 *
 * Prefer the pooled URL these provide: serverless functions open and drop
 * connections constantly, and the pooler is what keeps that inside Neon's
 * connection limit.
 */
function databaseUri(): string {
  const uri =
    process.env.DATABASE_URI ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!uri) {
    throw new Error(
      "No database connection string. Set DATABASE_URI, or link a Neon " +
        "database to the Vercel project so it provides DATABASE_URL.",
    );
  }

  return uri;
}

const resolvedBlobToken = blobToken();

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "— Redbrick IT Onboarding",
    },
  },

  collections: [ResourceSections, Media, Users],

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: databaseUri(),
    },
    // Payload pushes schema changes straight to the database in development.
    // In production it refuses to, so a deploy can't silently alter the
    // schema — run `npm run payload:migrate` as part of the release instead.
    push: process.env.NODE_ENV !== "production",
  }),

  // Used to sign cookies and hash tokens. Changing it invalidates existing
  // admin sessions.
  secret: process.env.PAYLOAD_SECRET ?? "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  sharp,

  plugins: resolvedBlobToken
    ? [
        vercelBlobStorage({
          collections: { [Media.slug]: true },
          token: resolvedBlobToken,
          // Upload straight from the browser to Blob instead of routing the
          // bytes through a serverless function.
          //
          // Vercel caps a function's request body at 4.5MB. A desktop
          // wallpaper clears that easily, and the admin surfaces the rejection
          // as an unexplained "Something went wrong". Client uploads ask the
          // server only for a short-lived token, so file size stops being a
          // function concern.
          clientUploads: true,
        }),
      ]
    : [],
});
