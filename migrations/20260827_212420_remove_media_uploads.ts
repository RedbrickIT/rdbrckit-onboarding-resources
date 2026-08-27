import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drop the media collection and the link -> file relationship.
 *
 * Payload generated this with `DROP TABLE "media" CASCADE` before the
 * `DROP CONSTRAINT` statements, which cannot work: CASCADE removes the
 * foreign keys itself, so the explicit drops then fail on constraints that no
 * longer exist. Dependants are removed first here, and every statement is
 * guarded with IF EXISTS so the order can't bite again.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "resource_sections_groups_links"
      DROP CONSTRAINT IF EXISTS "resource_sections_groups_links_file_id_media_id_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_media_fk";

    DROP INDEX IF EXISTS "resource_sections_groups_links_file_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_media_id_idx";

    ALTER TABLE "resource_sections_groups_links" DROP COLUMN IF EXISTS "file_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "media_id";

    DROP TABLE IF EXISTS "media" CASCADE;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "resource_sections_groups_links" ADD COLUMN "file_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  ALTER TABLE "resource_sections_groups_links" ADD CONSTRAINT "resource_sections_groups_links_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "resource_sections_groups_links_file_idx" ON "resource_sections_groups_links" USING btree ("file_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");`)
}
