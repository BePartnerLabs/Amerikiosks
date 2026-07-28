import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Brands got `versions.drafts` turned on in 20260724_214459_brands_drafts, which
 * created `_brands_v` empty. Payload's admin list runs through `queryDrafts`,
 * which reads ONLY the versions table filtered on `latest = true` — so the 20
 * brands that already existed became invisible in /admin (the public claim form
 * still saw them, since it queries the main table). An editor then re-created
 * seven of them by hand, which is where the duplicates came from.
 *
 * This backfills one `latest` version row per brand that has none, mirroring
 * the row Payload would have written on save. Deleting the duplicate documents
 * is a content decision and stays with the editor.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "_brands_v" (
      "parent_id", "version_name", "version_logo_id", "version_order",
      "version_updated_at", "version_created_at", "version__status",
      "latest", "created_at", "updated_at"
    )
    SELECT
      b."id", b."name", b."logo_id", b."order",
      b."updated_at", b."created_at", b."_status"::text::"enum__brands_v_version_status",
      true, now(), now()
    FROM "brands" b
    WHERE NOT EXISTS (SELECT 1 FROM "_brands_v" v WHERE v."parent_id" = b."id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Non-destructive by design: dropping the backfilled rows would hide those
  // brands from /admin again. Nothing to undo.
  await db.execute(sql`SELECT 1;`)
}
