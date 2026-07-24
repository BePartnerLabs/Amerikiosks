import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// No real claim data in production yet — deleting existing rows first instead of
// backfilling, so the new columns can go straight to NOT NULL (Postgres
// rejects ADD COLUMN ... NOT NULL without a default against a non-empty
// table, which is what the plain auto-generated version would have hit).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "claims";
  ALTER TABLE "claims" ADD COLUMN "customer_first_name" varchar NOT NULL;
  ALTER TABLE "claims" ADD COLUMN "customer_last_name" varchar NOT NULL;
  ALTER TABLE "claims" DROP COLUMN "customer_name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "claims";
  ALTER TABLE "claims" ADD COLUMN "customer_name" varchar NOT NULL;
  ALTER TABLE "claims" DROP COLUMN "customer_first_name";
  ALTER TABLE "claims" DROP COLUMN "customer_last_name";`)
}
