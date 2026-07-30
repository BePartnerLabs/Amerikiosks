import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_form_block_layout" AS ENUM('stacked', 'split');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_layout" AS ENUM('stacked', 'split');
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "layout" "enum_pages_blocks_form_block_layout" DEFAULT 'stacked';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "layout" "enum__pages_v_blocks_form_block_layout" DEFAULT 'stacked';
  ALTER TABLE "forms_locales" ADD COLUMN "description" jsonb;
  ALTER TABLE "forms_locales" ADD COLUMN "footnote" jsonb;
  ALTER TABLE "forms_locales" ADD COLUMN "confirmation_heading" varchar;
  ALTER TABLE "forms_locales" ADD COLUMN "confirmation_next" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_block" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "layout";
  ALTER TABLE "forms_locales" DROP COLUMN "description";
  ALTER TABLE "forms_locales" DROP COLUMN "footnote";
  ALTER TABLE "forms_locales" DROP COLUMN "confirmation_heading";
  ALTER TABLE "forms_locales" DROP COLUMN "confirmation_next";
  DROP TYPE "public"."enum_pages_blocks_form_block_layout";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_layout";`)
}
