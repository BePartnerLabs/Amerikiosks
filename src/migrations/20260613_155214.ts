import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_faq_with_form" ADD COLUMN "form_id" integer;
  ALTER TABLE "_pages_v_blocks_faq_with_form" ADD COLUMN "form_id" integer;
  ALTER TABLE "pages_blocks_faq_with_form" ADD CONSTRAINT "pages_blocks_faq_with_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_with_form" ADD CONSTRAINT "_pages_v_blocks_faq_with_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_faq_with_form_form_idx" ON "pages_blocks_faq_with_form" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_faq_with_form_form_idx" ON "_pages_v_blocks_faq_with_form" USING btree ("form_id");
  ALTER TABLE "pages_blocks_faq_with_form_locales" DROP COLUMN "form_heading";
  ALTER TABLE "pages_blocks_faq_with_form_locales" DROP COLUMN "form_subheading";
  ALTER TABLE "pages_blocks_faq_with_form_locales" DROP COLUMN "form_disclaimer";
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" DROP COLUMN "form_heading";
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" DROP COLUMN "form_subheading";
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" DROP COLUMN "form_disclaimer";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_faq_with_form" DROP CONSTRAINT "pages_blocks_faq_with_form_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_faq_with_form" DROP CONSTRAINT "_pages_v_blocks_faq_with_form_form_id_forms_id_fk";
  
  DROP INDEX "pages_blocks_faq_with_form_form_idx";
  DROP INDEX "_pages_v_blocks_faq_with_form_form_idx";
  ALTER TABLE "pages_blocks_faq_with_form_locales" ADD COLUMN "form_heading" varchar;
  ALTER TABLE "pages_blocks_faq_with_form_locales" ADD COLUMN "form_subheading" varchar;
  ALTER TABLE "pages_blocks_faq_with_form_locales" ADD COLUMN "form_disclaimer" varchar;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD COLUMN "form_heading" varchar;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD COLUMN "form_subheading" varchar;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD COLUMN "form_disclaimer" varchar;
  ALTER TABLE "pages_blocks_faq_with_form" DROP COLUMN "form_id";
  ALTER TABLE "_pages_v_blocks_faq_with_form" DROP COLUMN "form_id";`)
}
