import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Hand-trimmed. `migrate:create` also wanted to DROP the `autosave` column (and
// its index) from the five `_*_v` version tables — pre-existing drift, unrelated
// to this change: every collection turned autosave off in its `drafts` config,
// but no migration ever removed the columns the earlier config had created.
// Dropping columns is what closes /admin and /api behind the maintenance rules
// during a release (see #191), so it does not belong in a one-column additive
// migration. The columns are nullable, unwritten and unread — they cost nothing
// left in place. Clean them up deliberately, in their own migration.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "forms_locales" ADD COLUMN "display_title" varchar;`)

  // Seed the EN heading from the existing `title`, which is what the drawer has
  // been showing all along — so nothing changes on the public site the moment
  // this ships, and an editor opening the field sees the current wording rather
  // than a blank box.
  //
  // ES is left empty on purpose. Copying the English title into it would make
  // "translated" and "never translated" look identical in the admin, and the
  // rendered result is the same either way: the components fall back to `title`
  // when displayTitle is empty. An empty ES field is the to-do list.
  await db.execute(sql`
  INSERT INTO "forms_locales" ("_locale", "_parent_id", "display_title")
  SELECT 'en', "forms"."id", "forms"."title" FROM "forms"
  ON CONFLICT ("_locale", "_parent_id") DO UPDATE
    SET "display_title" = EXCLUDED."display_title"
    WHERE "forms_locales"."display_title" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "forms_locales" DROP COLUMN "display_title";`)
}
