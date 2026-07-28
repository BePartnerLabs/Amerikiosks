import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_contact_cta_type" AS ENUM('link', 'modal');
  ALTER TABLE "footer" ADD COLUMN "contact_cta_type" "enum_footer_contact_cta_type" DEFAULT 'link';
  ALTER TABLE "footer" ADD COLUMN "contact_cta_form_id" integer;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_contact_cta_form_id_forms_id_fk" FOREIGN KEY ("contact_cta_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "footer_contact_cta_form_idx" ON "footer" USING btree ("contact_cta_form_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP CONSTRAINT "footer_contact_cta_form_id_forms_id_fk";
  
  DROP INDEX "footer_contact_cta_form_idx";
  ALTER TABLE "footer" DROP COLUMN "contact_cta_type";
  ALTER TABLE "footer" DROP COLUMN "contact_cta_form_id";
  DROP TYPE "public"."enum_footer_contact_cta_type";`)
}
