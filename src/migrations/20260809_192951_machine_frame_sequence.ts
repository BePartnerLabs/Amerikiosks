import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines" ADD COLUMN "sequence_path" varchar;
  ALTER TABLE "machines" ADD COLUMN "frame_count" numeric;
  ALTER TABLE "_machines_v" ADD COLUMN "version_sequence_path" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_frame_count" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines" DROP COLUMN "sequence_path";
  ALTER TABLE "machines" DROP COLUMN "frame_count";
  ALTER TABLE "_machines_v" DROP COLUMN "version_sequence_path";
  ALTER TABLE "_machines_v" DROP COLUMN "version_frame_count";`)
}
