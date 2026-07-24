import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_default_claim_integration_target" AS ENUM('jotform', 'odoo', 'monday');
  ALTER TABLE "claims" ALTER COLUMN "integration_target" DROP DEFAULT;
  ALTER TABLE "settings" ADD COLUMN "default_claim_integration_target" "enum_settings_default_claim_integration_target" DEFAULT 'monday';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "claims" ALTER COLUMN "integration_target" SET DEFAULT 'jotform';
  ALTER TABLE "settings" DROP COLUMN "default_claim_integration_target";
  DROP TYPE "public"."enum_settings_default_claim_integration_target";`)
}
