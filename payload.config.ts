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
 * Blob storage is only wired up when a token is present.
 *
 * Vercel's filesystem is read-only apart from an ephemeral /tmp, so uploads
 * must go to Blob in production. Locally there is no token and Payload writes
 * to ./public/media instead, which keeps development zero-config.
 */
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

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
      connectionString: process.env.DATABASE_URI ?? "",
    },
    // Payload pushes schema changes straight to the database in development.
    // In production it refuses to, so a deploy can't silently alter the
    // schema — run `npm run payload migrate` as part of the release instead.
    push: process.env.NODE_ENV !== "production",
  }),

  // Used to sign cookies and hash tokens. Changing it invalidates existing
  // admin sessions.
  secret: process.env.PAYLOAD_SECRET ?? "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  sharp,

  plugins: blobToken
    ? [
        vercelBlobStorage({
          collections: { [Media.slug]: true },
          token: blobToken,
        }),
      ]
    : [],
});
