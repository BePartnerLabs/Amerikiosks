import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_audience_showcase_items_target" AS ENUM('page', 'form');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_showcase_items_target" AS ENUM('page', 'form');
  ALTER TYPE "public"."enum_pages_blocks_card_grid_items_link_type" ADD VALUE 'none' BEFORE 'custom';
  ALTER TYPE "public"."enum__pages_v_blocks_card_grid_items_link_type" ADD VALUE 'none' BEFORE 'custom';
  ALTER TABLE "pages_blocks_audience_showcase_items" ADD COLUMN "target" "enum_pages_blocks_audience_showcase_items_target" DEFAULT 'page';
  ALTER TABLE "pages_blocks_audience_showcase_items" ADD COLUMN "form_id" integer;
  ALTER TABLE "pages_blocks_model_lines" ADD COLUMN "form_id" integer;
  ALTER TABLE "_pages_v_blocks_audience_showcase_items" ADD COLUMN "target" "enum__pages_v_blocks_audience_showcase_items_target" DEFAULT 'page';
  ALTER TABLE "_pages_v_blocks_audience_showcase_items" ADD COLUMN "form_id" integer;
  ALTER TABLE "_pages_v_blocks_model_lines" ADD COLUMN "form_id" integer;
  ALTER TABLE "pages_blocks_audience_showcase_items" ADD CONSTRAINT "pages_blocks_audience_showcase_items_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_model_lines" ADD CONSTRAINT "pages_blocks_model_lines_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audience_showcase_items" ADD CONSTRAINT "_pages_v_blocks_audience_showcase_items_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_model_lines" ADD CONSTRAINT "_pages_v_blocks_model_lines_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_audience_showcase_items_form_idx" ON "pages_blocks_audience_showcase_items" USING btree ("form_id");
  CREATE INDEX "pages_blocks_model_lines_form_idx" ON "pages_blocks_model_lines" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_audience_showcase_items_form_idx" ON "_pages_v_blocks_audience_showcase_items" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_model_lines_form_idx" ON "_pages_v_blocks_model_lines" USING btree ("form_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_audience_showcase_items" DROP CONSTRAINT "pages_blocks_audience_showcase_items_form_id_forms_id_fk";
  
  ALTER TABLE "pages_blocks_model_lines" DROP CONSTRAINT "pages_blocks_model_lines_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_audience_showcase_items" DROP CONSTRAINT "_pages_v_blocks_audience_showcase_items_form_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_model_lines" DROP CONSTRAINT "_pages_v_blocks_model_lines_form_id_forms_id_fk";
  
  ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "link_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum_pages_blocks_card_grid_items_link_type";
  CREATE TYPE "public"."enum_pages_blocks_card_grid_items_link_type" AS ENUM('custom', 'reference');
  ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "link_type" SET DEFAULT 'custom'::"public"."enum_pages_blocks_card_grid_items_link_type";
  ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_pages_blocks_card_grid_items_link_type" USING "link_type"::"public"."enum_pages_blocks_card_grid_items_link_type";
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "link_type" SET DEFAULT 'custom'::text;
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_items_link_type";
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_items_link_type" AS ENUM('custom', 'reference');
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "link_type" SET DEFAULT 'custom'::"public"."enum__pages_v_blocks_card_grid_items_link_type";
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum__pages_v_blocks_card_grid_items_link_type" USING "link_type"::"public"."enum__pages_v_blocks_card_grid_items_link_type";
  DROP INDEX "pages_blocks_audience_showcase_items_form_idx";
  DROP INDEX "pages_blocks_model_lines_form_idx";
  DROP INDEX "_pages_v_blocks_audience_showcase_items_form_idx";
  DROP INDEX "_pages_v_blocks_model_lines_form_idx";
  ALTER TABLE "pages_blocks_audience_showcase_items" DROP COLUMN "target";
  ALTER TABLE "pages_blocks_audience_showcase_items" DROP COLUMN "form_id";
  ALTER TABLE "pages_blocks_model_lines" DROP COLUMN "form_id";
  ALTER TABLE "_pages_v_blocks_audience_showcase_items" DROP COLUMN "target";
  ALTER TABLE "_pages_v_blocks_audience_showcase_items" DROP COLUMN "form_id";
  ALTER TABLE "_pages_v_blocks_model_lines" DROP COLUMN "form_id";
  DROP TYPE "public"."enum_pages_blocks_audience_showcase_items_target";
  DROP TYPE "public"."enum__pages_v_blocks_audience_showcase_items_target";`)
}
