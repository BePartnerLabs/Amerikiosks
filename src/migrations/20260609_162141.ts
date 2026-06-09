import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_audience_showcase_items_locales" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_blocks_audience_showcase_items_locales" ADD COLUMN "description" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_audience_showcase_items_locales" DROP COLUMN "description";
  ALTER TABLE "_pages_v_blocks_audience_showcase_items_locales" DROP COLUMN "description";`)
}
