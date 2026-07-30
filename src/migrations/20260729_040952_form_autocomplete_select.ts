import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_blocks_email_autocomplete" AS ENUM('off', 'name', 'given-name', 'family-name', 'email', 'tel', 'organization', 'organization-title', 'url', 'street-address', 'address-level2', 'address-level1', 'postal-code', 'country-name');
  CREATE TYPE "public"."enum_forms_blocks_number_autocomplete" AS ENUM('off', 'name', 'given-name', 'family-name', 'email', 'tel', 'organization', 'organization-title', 'url', 'street-address', 'address-level2', 'address-level1', 'postal-code', 'country-name');
  CREATE TYPE "public"."enum_forms_blocks_text_autocomplete" AS ENUM('off', 'name', 'given-name', 'family-name', 'email', 'tel', 'organization', 'organization-title', 'url', 'street-address', 'address-level2', 'address-level1', 'postal-code', 'country-name');
  CREATE TYPE "public"."enum_forms_blocks_textarea_autocomplete" AS ENUM('off', 'name', 'given-name', 'family-name', 'email', 'tel', 'organization', 'organization-title', 'url', 'street-address', 'address-level2', 'address-level1', 'postal-code', 'country-name');
  ALTER TABLE "forms_blocks_email" ALTER COLUMN "autocomplete" SET DATA TYPE "public"."enum_forms_blocks_email_autocomplete" USING "autocomplete"::"public"."enum_forms_blocks_email_autocomplete";
  ALTER TABLE "forms_blocks_number" ALTER COLUMN "autocomplete" SET DATA TYPE "public"."enum_forms_blocks_number_autocomplete" USING "autocomplete"::"public"."enum_forms_blocks_number_autocomplete";
  ALTER TABLE "forms_blocks_text" ALTER COLUMN "autocomplete" SET DATA TYPE "public"."enum_forms_blocks_text_autocomplete" USING "autocomplete"::"public"."enum_forms_blocks_text_autocomplete";
  ALTER TABLE "forms_blocks_textarea" ALTER COLUMN "autocomplete" SET DATA TYPE "public"."enum_forms_blocks_textarea_autocomplete" USING "autocomplete"::"public"."enum_forms_blocks_textarea_autocomplete";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms_blocks_email" ALTER COLUMN "autocomplete" SET DATA TYPE varchar;
  ALTER TABLE "forms_blocks_number" ALTER COLUMN "autocomplete" SET DATA TYPE varchar;
  ALTER TABLE "forms_blocks_text" ALTER COLUMN "autocomplete" SET DATA TYPE varchar;
  ALTER TABLE "forms_blocks_textarea" ALTER COLUMN "autocomplete" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_forms_blocks_email_autocomplete";
  DROP TYPE "public"."enum_forms_blocks_number_autocomplete";
  DROP TYPE "public"."enum_forms_blocks_text_autocomplete";
  DROP TYPE "public"."enum_forms_blocks_textarea_autocomplete";`)
}
