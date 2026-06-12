import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_process_steps_cta_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_cta_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "pages_blocks_formats_grid_filter_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "pages_blocks_formats_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"machine_id" integer
  );
  
  CREATE TABLE "pages_blocks_formats_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_formats_grid_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_process_steps_cta_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_appearance" "enum_pages_blocks_process_steps_cta_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_process_steps_cta_locales" (
  	"link_url" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_with_form_filter_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_with_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_with_form_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"form_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_formats_grid_filter_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_formats_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"machine_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_formats_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_formats_grid_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_process_steps_cta_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_appearance" "enum__pages_v_blocks_process_steps_cta_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_cta_locales" (
  	"link_url" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq_with_form_filter_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_with_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_with_form_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"form_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_formats_grid_filter_tags" ADD CONSTRAINT "pages_blocks_formats_grid_filter_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_formats_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_formats_grid_items" ADD CONSTRAINT "pages_blocks_formats_grid_items_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_formats_grid_items" ADD CONSTRAINT "pages_blocks_formats_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_formats_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_formats_grid" ADD CONSTRAINT "pages_blocks_formats_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_formats_grid_locales" ADD CONSTRAINT "pages_blocks_formats_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_formats_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps" ADD CONSTRAINT "pages_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps_locales" ADD CONSTRAINT "pages_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_cta" ADD CONSTRAINT "pages_blocks_process_steps_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_cta_locales" ADD CONSTRAINT "pages_blocks_process_steps_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_locales" ADD CONSTRAINT "pages_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_with_form_filter_tags" ADD CONSTRAINT "pages_blocks_faq_with_form_filter_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_with_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_with_form" ADD CONSTRAINT "pages_blocks_faq_with_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_with_form_locales" ADD CONSTRAINT "pages_blocks_faq_with_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_with_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_formats_grid_filter_tags" ADD CONSTRAINT "_pages_v_blocks_formats_grid_filter_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_formats_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_formats_grid_items" ADD CONSTRAINT "_pages_v_blocks_formats_grid_items_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_formats_grid_items" ADD CONSTRAINT "_pages_v_blocks_formats_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_formats_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_formats_grid" ADD CONSTRAINT "_pages_v_blocks_formats_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_formats_grid_locales" ADD CONSTRAINT "_pages_v_blocks_formats_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_formats_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps_locales" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_cta" ADD CONSTRAINT "_pages_v_blocks_process_steps_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_cta_locales" ADD CONSTRAINT "_pages_v_blocks_process_steps_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_locales" ADD CONSTRAINT "_pages_v_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_with_form_filter_tags" ADD CONSTRAINT "_pages_v_blocks_faq_with_form_filter_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_with_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_with_form" ADD CONSTRAINT "_pages_v_blocks_faq_with_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_with_form_locales" ADD CONSTRAINT "_pages_v_blocks_faq_with_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_with_form"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_formats_grid_filter_tags_order_idx" ON "pages_blocks_formats_grid_filter_tags" USING btree ("_order");
  CREATE INDEX "pages_blocks_formats_grid_filter_tags_parent_id_idx" ON "pages_blocks_formats_grid_filter_tags" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_formats_grid_items_order_idx" ON "pages_blocks_formats_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_formats_grid_items_parent_id_idx" ON "pages_blocks_formats_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_formats_grid_items_machine_idx" ON "pages_blocks_formats_grid_items" USING btree ("machine_id");
  CREATE INDEX "pages_blocks_formats_grid_order_idx" ON "pages_blocks_formats_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_formats_grid_parent_id_idx" ON "pages_blocks_formats_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_formats_grid_path_idx" ON "pages_blocks_formats_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_formats_grid_locales_locale_parent_id_unique" ON "pages_blocks_formats_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_process_steps_steps_order_idx" ON "pages_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_steps_parent_id_idx" ON "pages_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_process_steps_steps_locales_locale_parent_id_un" ON "pages_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_process_steps_cta_order_idx" ON "pages_blocks_process_steps_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_cta_parent_id_idx" ON "pages_blocks_process_steps_cta" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_process_steps_cta_locales_locale_parent_id_uniq" ON "pages_blocks_process_steps_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_path_idx" ON "pages_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_process_steps_locales_locale_parent_id_unique" ON "pages_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_with_form_filter_tags_order_idx" ON "pages_blocks_faq_with_form_filter_tags" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_with_form_filter_tags_parent_id_idx" ON "pages_blocks_faq_with_form_filter_tags" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_with_form_order_idx" ON "pages_blocks_faq_with_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_with_form_parent_id_idx" ON "pages_blocks_faq_with_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_with_form_path_idx" ON "pages_blocks_faq_with_form" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_faq_with_form_locales_locale_parent_id_unique" ON "pages_blocks_faq_with_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_formats_grid_filter_tags_order_idx" ON "_pages_v_blocks_formats_grid_filter_tags" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_formats_grid_filter_tags_parent_id_idx" ON "_pages_v_blocks_formats_grid_filter_tags" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_formats_grid_items_order_idx" ON "_pages_v_blocks_formats_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_formats_grid_items_parent_id_idx" ON "_pages_v_blocks_formats_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_formats_grid_items_machine_idx" ON "_pages_v_blocks_formats_grid_items" USING btree ("machine_id");
  CREATE INDEX "_pages_v_blocks_formats_grid_order_idx" ON "_pages_v_blocks_formats_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_formats_grid_parent_id_idx" ON "_pages_v_blocks_formats_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_formats_grid_path_idx" ON "_pages_v_blocks_formats_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_formats_grid_locales_locale_parent_id_unique" ON "_pages_v_blocks_formats_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_order_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_parent_id_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_steps_steps_locales_locale_parent_id" ON "_pages_v_blocks_process_steps_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_cta_order_idx" ON "_pages_v_blocks_process_steps_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_cta_parent_id_idx" ON "_pages_v_blocks_process_steps_cta" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_steps_cta_locales_locale_parent_id_u" ON "_pages_v_blocks_process_steps_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_path_idx" ON "_pages_v_blocks_process_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_steps_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_with_form_filter_tags_order_idx" ON "_pages_v_blocks_faq_with_form_filter_tags" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_with_form_filter_tags_parent_id_idx" ON "_pages_v_blocks_faq_with_form_filter_tags" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_with_form_order_idx" ON "_pages_v_blocks_faq_with_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_with_form_parent_id_idx" ON "_pages_v_blocks_faq_with_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_with_form_path_idx" ON "_pages_v_blocks_faq_with_form" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_with_form_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_faq_with_form_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_formats_grid_filter_tags" CASCADE;
  DROP TABLE "pages_blocks_formats_grid_items" CASCADE;
  DROP TABLE "pages_blocks_formats_grid" CASCADE;
  DROP TABLE "pages_blocks_formats_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_process_steps_cta" CASCADE;
  DROP TABLE "pages_blocks_process_steps_cta_locales" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_process_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_faq_with_form_filter_tags" CASCADE;
  DROP TABLE "pages_blocks_faq_with_form" CASCADE;
  DROP TABLE "pages_blocks_faq_with_form_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_formats_grid_filter_tags" CASCADE;
  DROP TABLE "_pages_v_blocks_formats_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_formats_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_formats_grid_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_cta_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_with_form_filter_tags" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_with_form" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_with_form_locales" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_process_steps_cta_link_type";
  DROP TYPE "public"."enum_pages_blocks_process_steps_cta_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_cta_link_appearance";`)
}
