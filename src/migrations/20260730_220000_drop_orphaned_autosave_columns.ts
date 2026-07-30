import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Pre-existing drift, cleaned up on its own rather than folded into a feature
// migration. Every drafts-enabled collection turned autosave off in its config
// (see the note in Insights), but no migration ever removed the `autosave`
// column and index the earlier config had created — so `migrate:create` kept
// proposing the drop on top of whatever unrelated change was being generated.
// Confirmed present in a production restore, not just a stale local database.
//
// Safe to drop while the site is serving: these are version-history tables, not
// what the frontend reads, and the deployed schema already does not declare the
// column, so no running code selects it. In Postgres DROP COLUMN only rewrites
// catalog metadata, so the ACCESS EXCLUSIVE lock is momentary — this is not the
// kind of migration that can hang a release.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX "_pages_v_autosave_idx";
  DROP INDEX "_insights_v_autosave_idx";
  DROP INDEX "_machines_v_autosave_idx";
  DROP INDEX "_machine_families_v_autosave_idx";
  DROP INDEX "_projects_v_autosave_idx";
  ALTER TABLE "_pages_v" DROP COLUMN "autosave";
  ALTER TABLE "_insights_v" DROP COLUMN "autosave";
  ALTER TABLE "_machines_v" DROP COLUMN "autosave";
  ALTER TABLE "_machine_families_v" DROP COLUMN "autosave";
  ALTER TABLE "_projects_v" DROP COLUMN "autosave";`)
}

// Recreates the shape, not the values — the column was already unwritten, so
// there is nothing to restore into it.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "_pages_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_insights_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_machines_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_machine_families_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_projects_v" ADD COLUMN "autosave" boolean;
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_insights_v_autosave_idx" ON "_insights_v" USING btree ("autosave");
  CREATE INDEX "_machines_v_autosave_idx" ON "_machines_v" USING btree ("autosave");
  CREATE INDEX "_machine_families_v_autosave_idx" ON "_machine_families_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");`)
}
