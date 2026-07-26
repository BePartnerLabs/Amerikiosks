import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "claims" SET "integration_target" = 'monday' WHERE "integration_target" = 'jotform';
  UPDATE "settings" SET "default_claim_integration_target" = 'monday' WHERE "default_claim_integration_target" = 'jotform';
  ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DATA TYPE text;
  DROP TYPE "public"."enum_claims_integration_target";
  CREATE TYPE "public"."enum_claims_integration_target" AS ENUM('odoo', 'monday');
  ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DATA TYPE "public"."enum_claims_integration_target" USING "integration_target"::"public"."enum_claims_integration_target";
  ALTER TABLE "settings" ALTER COLUMN "default_claim_integration_target" SET DATA TYPE text;
  ALTER TABLE "settings" ALTER COLUMN "default_claim_integration_target" SET DEFAULT 'monday'::text;
  DROP TYPE "public"."enum_settings_default_claim_integration_target";
  CREATE TYPE "public"."enum_settings_default_claim_integration_target" AS ENUM('odoo', 'monday');
  ALTER TABLE "settings" ALTER COLUMN "default_claim_integration_target" SET DEFAULT 'monday'::"public"."enum_settings_default_claim_integration_target";
  ALTER TABLE "settings" ALTER COLUMN "default_claim_integration_target" SET DATA TYPE "public"."enum_settings_default_claim_integration_target" USING "default_claim_integration_target"::"public"."enum_settings_default_claim_integration_target";
  ALTER TABLE "settings" DROP COLUMN "jotform_api_key";
  ALTER TABLE "settings" DROP COLUMN "jotform_form_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_claims_integration_target" ADD VALUE 'jotform' BEFORE 'odoo';
  ALTER TYPE "public"."enum_settings_default_claim_integration_target" ADD VALUE 'jotform' BEFORE 'odoo';
  ALTER TABLE "settings" ADD COLUMN "jotform_api_key" varchar;
  ALTER TABLE "settings" ADD COLUMN "jotform_form_id" varchar;`)
}
