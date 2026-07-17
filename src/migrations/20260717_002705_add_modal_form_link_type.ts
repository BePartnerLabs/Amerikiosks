import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_hero_links_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum_pages_blocks_cta_links_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum_pages_blocks_process_steps_cta_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum__pages_v_blocks_cta_links_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum_header_nav_items_mega_menu_items_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum_header_nav_items_link_type" ADD VALUE 'modal';
  ALTER TYPE "public"."enum_footer_columns_links_link_type" ADD VALUE 'modal';
  ALTER TABLE "pages_hero_links" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "pages_blocks_process_steps_cta" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "_pages_v_version_hero_links" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "header_nav_items_mega_menu_items" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "header_nav_items" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "footer_columns_links" ADD COLUMN "link_modal_form_id" integer;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_cta" ADD CONSTRAINT "pages_blocks_process_steps_cta_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ADD CONSTRAINT "_pages_v_blocks_process_steps_cta_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items_mega_menu_items" ADD CONSTRAINT "header_nav_items_mega_menu_items_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_link_modal_form_id_forms_id_fk" FOREIGN KEY ("link_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_links_link_link_modal_form_idx" ON "pages_hero_links" USING btree ("link_modal_form_id");
  CREATE INDEX "pages_blocks_cta_links_link_link_modal_form_idx" ON "pages_blocks_cta_links" USING btree ("link_modal_form_id");
  CREATE INDEX "pages_blocks_content_columns_link_link_modal_form_idx" ON "pages_blocks_content_columns" USING btree ("link_modal_form_id");
  CREATE INDEX "pages_blocks_process_steps_cta_link_link_modal_form_idx" ON "pages_blocks_process_steps_cta" USING btree ("link_modal_form_id");
  CREATE INDEX "_pages_v_version_hero_links_link_link_modal_form_idx" ON "_pages_v_version_hero_links" USING btree ("link_modal_form_id");
  CREATE INDEX "_pages_v_blocks_cta_links_link_link_modal_form_idx" ON "_pages_v_blocks_cta_links" USING btree ("link_modal_form_id");
  CREATE INDEX "_pages_v_blocks_content_columns_link_link_modal_form_idx" ON "_pages_v_blocks_content_columns" USING btree ("link_modal_form_id");
  CREATE INDEX "_pages_v_blocks_process_steps_cta_link_link_modal_form_idx" ON "_pages_v_blocks_process_steps_cta" USING btree ("link_modal_form_id");
  CREATE INDEX "header_nav_items_mega_menu_items_link_link_modal_form_idx" ON "header_nav_items_mega_menu_items" USING btree ("link_modal_form_id");
  CREATE INDEX "header_nav_items_link_link_modal_form_idx" ON "header_nav_items" USING btree ("link_modal_form_id");
  CREATE INDEX "footer_columns_links_link_link_modal_form_idx" ON "footer_columns_links" USING btree ("link_modal_form_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_links" DROP CONSTRAINT "pages_hero_links_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "pages_blocks_cta_links" DROP CONSTRAINT "pages_blocks_cta_links_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "pages_blocks_process_steps_cta" DROP CONSTRAINT "pages_blocks_process_steps_cta_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_version_hero_links" DROP CONSTRAINT "_pages_v_version_hero_links_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_cta_links" DROP CONSTRAINT "_pages_v_blocks_cta_links_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_process_steps_cta" DROP CONSTRAINT "_pages_v_blocks_process_steps_cta_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "header_nav_items_mega_menu_items" DROP CONSTRAINT "header_nav_items_mega_menu_items_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "header_nav_items" DROP CONSTRAINT "header_nav_items_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "footer_columns_links" DROP CONSTRAINT "footer_columns_links_link_modal_form_id_forms_id_fk";
  
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_pages_hero_links_link_type";
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_hero_links_link_type" USING "link_type"::"public"."enum_pages_hero_links_link_type";
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_pages_blocks_cta_links_link_type";
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_blocks_cta_links_link_type" USING "link_type"::"public"."enum_pages_blocks_cta_links_link_type";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_pages_blocks_content_columns_link_type";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_blocks_content_columns_link_type" USING "link_type"::"public"."enum_pages_blocks_content_columns_link_type";
  ALTER TABLE "pages_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_pages_blocks_process_steps_cta_link_type";
  CREATE TYPE "public"."enum_pages_blocks_process_steps_cta_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "pages_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_pages_blocks_process_steps_cta_link_type";
  ALTER TABLE "pages_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_blocks_process_steps_cta_link_type" USING "link_type"::"public"."enum_pages_blocks_process_steps_cta_link_type";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum__pages_v_version_hero_links_link_type";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum__pages_v_version_hero_links_link_type" USING "link_type"::"public"."enum__pages_v_version_hero_links_link_type";
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum__pages_v_blocks_cta_links_link_type";
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum__pages_v_blocks_cta_links_link_type" USING "link_type"::"public"."enum__pages_v_blocks_cta_links_link_type";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum__pages_v_blocks_content_columns_link_type";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_link_type" USING "link_type"::"public"."enum__pages_v_blocks_content_columns_link_type";
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_type";
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum__pages_v_blocks_process_steps_cta_link_type";
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_type" USING "link_type"::"public"."enum__pages_v_blocks_process_steps_cta_link_type";
  ALTER TABLE "header_nav_items_mega_menu_items" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "header_nav_items_mega_menu_items" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_header_nav_items_mega_menu_items_link_type";
  CREATE TYPE "public"."enum_header_nav_items_mega_menu_items_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "header_nav_items_mega_menu_items" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_header_nav_items_mega_menu_items_link_type";
  ALTER TABLE "header_nav_items_mega_menu_items" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_header_nav_items_mega_menu_items_link_type" USING "link_type"::"public"."enum_header_nav_items_mega_menu_items_link_type";
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_header_nav_items_link_type";
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_header_nav_items_link_type";
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_header_nav_items_link_type" USING "link_type"::"public"."enum_header_nav_items_link_type";
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_footer_columns_links_link_type";
  ALTER TABLE "footer_columns_links" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_footer_columns_links_link_type" USING "link_type"::"public"."enum_footer_columns_links_link_type";
  DROP INDEX "pages_hero_links_link_link_modal_form_idx";
  DROP INDEX "pages_blocks_cta_links_link_link_modal_form_idx";
  DROP INDEX "pages_blocks_content_columns_link_link_modal_form_idx";
  DROP INDEX "pages_blocks_process_steps_cta_link_link_modal_form_idx";
  DROP INDEX "_pages_v_version_hero_links_link_link_modal_form_idx";
  DROP INDEX "_pages_v_blocks_cta_links_link_link_modal_form_idx";
  DROP INDEX "_pages_v_blocks_content_columns_link_link_modal_form_idx";
  DROP INDEX "_pages_v_blocks_process_steps_cta_link_link_modal_form_idx";
  DROP INDEX "header_nav_items_mega_menu_items_link_link_modal_form_idx";
  DROP INDEX "header_nav_items_link_link_modal_form_idx";
  DROP INDEX "footer_columns_links_link_link_modal_form_idx";
  ALTER TABLE "pages_hero_links" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "pages_blocks_process_steps_cta" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "_pages_v_version_hero_links" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "_pages_v_blocks_process_steps_cta" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "header_nav_items_mega_menu_items" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_modal_form_id";
  ALTER TABLE "footer_columns_links" DROP COLUMN "link_modal_form_id";`)
}
