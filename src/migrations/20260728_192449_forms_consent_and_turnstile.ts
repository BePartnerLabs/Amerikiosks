import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms" ADD COLUMN "requires_consent" boolean DEFAULT false;
  ALTER TABLE "forms_locales" ADD COLUMN "consent_text" jsonb;
  ALTER TABLE "form_submissions" ADD COLUMN "consent_given" boolean;
  ALTER TABLE "form_submissions" ADD COLUMN "consent_at" timestamp(3) with time zone;
  ALTER TABLE "settings" ADD COLUMN "turnstile_enabled" boolean DEFAULT false;
  ALTER TABLE "settings" ADD COLUMN "turnstile_site_key" varchar;
  ALTER TABLE "settings" ADD COLUMN "turnstile_secret_key" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms" DROP COLUMN "requires_consent";
  ALTER TABLE "forms_locales" DROP COLUMN "consent_text";
  ALTER TABLE "form_submissions" DROP COLUMN "consent_given";
  ALTER TABLE "form_submissions" DROP COLUMN "consent_at";
  ALTER TABLE "settings" DROP COLUMN "turnstile_enabled";
  ALTER TABLE "settings" DROP COLUMN "turnstile_site_key";
  ALTER TABLE "settings" DROP COLUMN "turnstile_secret_key";`)
}
