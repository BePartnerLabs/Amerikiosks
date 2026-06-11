import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "insights" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "_insights_v" ADD COLUMN "version_featured" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "insights" DROP COLUMN "featured";
  ALTER TABLE "_insights_v" DROP COLUMN "version_featured";`)
}
