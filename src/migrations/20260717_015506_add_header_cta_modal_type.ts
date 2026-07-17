import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_cta_type" AS ENUM('custom', 'modal');
  ALTER TABLE "header" ALTER COLUMN "cta_url" DROP NOT NULL;
  ALTER TABLE "header" ADD COLUMN "cta_type" "enum_header_cta_type" DEFAULT 'custom';
  ALTER TABLE "header" ADD COLUMN "cta_modal_form_id" integer;
  ALTER TABLE "header" ADD CONSTRAINT "header_cta_modal_form_id_forms_id_fk" FOREIGN KEY ("cta_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_cta_cta_modal_form_idx" ON "header" USING btree ("cta_modal_form_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header" DROP CONSTRAINT "header_cta_modal_form_id_forms_id_fk";
  
  DROP INDEX "header_cta_cta_modal_form_idx";
  ALTER TABLE "header" ALTER COLUMN "cta_url" SET NOT NULL;
  ALTER TABLE "header" DROP COLUMN "cta_type";
  ALTER TABLE "header" DROP COLUMN "cta_modal_form_id";
  DROP TYPE "public"."enum_header_cta_type";`)
}
