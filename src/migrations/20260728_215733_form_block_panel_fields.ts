import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_block" ADD COLUMN "panel_label" varchar;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "panel_headline" varchar;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "panel_label" varchar;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "panel_headline" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_block" DROP COLUMN "panel_label";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "panel_headline";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "panel_label";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "panel_headline";`)
}
