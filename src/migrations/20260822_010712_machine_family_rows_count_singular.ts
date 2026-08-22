import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_machine_family_rows_locales" ADD COLUMN "count_eyebrow_one" varchar DEFAULT 'model in line';
  ALTER TABLE "_pages_v_blocks_machine_family_rows_locales" ADD COLUMN "count_eyebrow_one" varchar DEFAULT 'model in line';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_machine_family_rows_locales" DROP COLUMN "count_eyebrow_one";
  ALTER TABLE "_pages_v_blocks_machine_family_rows_locales" DROP COLUMN "count_eyebrow_one";`)
}
