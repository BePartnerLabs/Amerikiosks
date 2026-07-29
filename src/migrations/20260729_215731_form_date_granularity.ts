import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_blocks_date_granularity" AS ENUM('date', 'dateAndTime');
  ALTER TABLE "forms_blocks_date" ADD COLUMN "granularity" "enum_forms_blocks_date_granularity" DEFAULT 'date';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms_blocks_date" DROP COLUMN "granularity";
  DROP TYPE "public"."enum_forms_blocks_date_granularity";`)
}
