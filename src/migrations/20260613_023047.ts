import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_faq_with_form_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_faq_with_form_locales" ADD COLUMN "form_subheading" varchar;
  ALTER TABLE "pages_blocks_faq_with_form_locales" ADD COLUMN "form_disclaimer" varchar;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD COLUMN "form_subheading" varchar;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD COLUMN "form_disclaimer" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_faq_with_form_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_faq_with_form_locales" DROP COLUMN "form_subheading";
  ALTER TABLE "pages_blocks_faq_with_form_locales" DROP COLUMN "form_disclaimer";
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" DROP COLUMN "form_subheading";
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" DROP COLUMN "form_disclaimer";`)
}
