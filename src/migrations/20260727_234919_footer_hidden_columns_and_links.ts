import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_columns_links" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "footer_columns" ADD COLUMN "hidden" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_columns_links" DROP COLUMN "hidden";
  ALTER TABLE "footer_columns" DROP COLUMN "hidden";`)
}
