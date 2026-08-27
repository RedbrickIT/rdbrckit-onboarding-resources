import { getPayload, readMigrationFiles } from "payload";
import config from "@payload-config";

/**
 * Apply pending migrations without ever prompting.
 *
 * `payload migrate` asks for confirmation when it finds the `dev` marker row
 * that dev-mode schema pushes leave in `payload_migrations` (batch `-1`). With
 * no TTY the prompt never resolves — it does not fall back to a default — so a
 * CI or Vercel build hangs until the job times out. `--forceAcceptWarning` does
 * not help: the CLI only forwards that flag to `migrate:create` and
 * `migrate:fresh`, never to plain `migrate`.
 *
 * So decide here instead, and only take the decision that is provably safe:
 *
 * - Marker present, every migration file already recorded — the marker is
 *   vestigial. Drop it and carry on; there is nothing to apply and nothing to
 *   lose.
 * - Marker present with migrations still pending — the schema may have been
 *   pushed into a shape those migrations would try to create, so applying them
 *   could fail halfway or discard columns. Refuse, and say what to do.
 * - No marker — the ordinary path.
 *
 * Never exits 0 without having applied what was pending. A build that silently
 * skips migrations is worse than one that fails, because the app then boots
 * against a schema it does not match.
 */
const ACCEPT_DEV_PUSH = process.env.PAYLOAD_MIGRATE_ACCEPT_DEV_PUSH === "true";

const payload = await getPayload({ config });

const migrationFiles = await readMigrationFiles({ payload });

/**
 * Read the migration rows, tolerating a database that has never been migrated
 * — the table itself is created by the first migration.
 */
async function recordedMigrations(): Promise<
  { batch: number; name: string }[]
> {
  try {
    const { docs } = await payload.find({
      collection: "payload-migrations",
      limit: 0,
      pagination: false,
      sort: "name",
    });
    return docs.map((doc) => ({
      batch: Number(doc.batch ?? 0),
      name: String(doc.name ?? ""),
    }));
  } catch {
    return [];
  }
}

const recorded = await recordedMigrations();
const marker = recorded.find((row) => row.batch === -1);
const applied = new Set(
  recorded.filter((row) => row.batch !== -1).map((row) => row.name),
);
const pending = migrationFiles.filter((file) => !applied.has(file.name));

payload.logger.info(
  `${migrationFiles.length} migration file(s), ${applied.size} applied, ` +
    `${pending.length} pending${marker ? ", dev marker present" : ""}.`,
);

if (marker && pending.length > 0 && !ACCEPT_DEV_PUSH) {
  payload.logger.error(
    `Refusing to migrate. This database carries the dev-mode marker row, so ` +
      `its schema was pushed directly rather than migrated, and ` +
      `${pending.length} migration(s) are still pending: ` +
      `${pending.map((file) => file.name).join(", ")}. Applying them could ` +
      `fail against the pushed schema or drop data.\n\n` +
      `If the pushed schema is disposable, reset the database and migrate it ` +
      `from scratch. If it holds data you need, reconcile it by hand, then ` +
      `re-run with PAYLOAD_MIGRATE_ACCEPT_DEV_PUSH=true to accept the risk.`,
  );
  process.exit(1);
}

if (marker) {
  await payload.delete({
    collection: "payload-migrations",
    where: { batch: { equals: -1 } },
  });
  payload.logger.info(
    pending.length === 0
      ? "Removed the vestigial dev marker; schema already matches the migrations."
      : "Removed the dev marker at your instruction; applying migrations.",
  );
}

if (pending.length === 0) {
  payload.logger.info("Nothing to apply.");
} else {
  await payload.db.migrate();
  payload.logger.info(`Applied ${pending.length} migration(s).`);
}

process.exit(0);
