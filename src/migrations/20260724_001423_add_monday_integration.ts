import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_claims_integration_target" ADD VALUE 'monday';
  ALTER TABLE "settings" ADD COLUMN "monday_api_token" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DATA TYPE text;
  ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DEFAULT 'jotform'::text;
  DROP TYPE "public"."enum_claims_integration_target";
  CREATE TYPE "public"."enum_claims_integration_target" AS ENUM('jotform', 'odoo');
  ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DEFAULT 'jotform'::"public"."enum_claims_integration_target";
  ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DATA TYPE "public"."enum_claims_integration_target" USING "integration_target"::"public"."enum_claims_integration_target";
  ALTER TABLE "settings" DROP COLUMN "monday_api_token";`)
}
