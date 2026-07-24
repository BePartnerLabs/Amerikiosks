import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_metrics_link_type" AS ENUM('custom', 'reference');
  CREATE TYPE "public"."enum__pages_v_blocks_metrics_link_type" AS ENUM('custom', 'reference');
  CREATE TABLE "pages_blocks_metrics_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_url" varchar,
  	"link_type" "enum_pages_blocks_metrics_link_type" DEFAULT 'custom',
  	"link_reference_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_metrics_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_metrics_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_url" varchar,
  	"link_type" "enum__pages_v_blocks_metrics_link_type" DEFAULT 'custom',
  	"link_reference_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_metrics_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_metrics_items" ADD CONSTRAINT "pages_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_metrics" ADD CONSTRAINT "pages_blocks_metrics_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_metrics" ADD CONSTRAINT "pages_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_metrics_locales" ADD CONSTRAINT "pages_blocks_metrics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_metrics_items" ADD CONSTRAINT "_pages_v_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_metrics" ADD CONSTRAINT "_pages_v_blocks_metrics_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_metrics" ADD CONSTRAINT "_pages_v_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_metrics_locales" ADD CONSTRAINT "_pages_v_blocks_metrics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_metrics_items_order_idx" ON "pages_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_metrics_items_parent_id_idx" ON "pages_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_metrics_items_locale_idx" ON "pages_blocks_metrics_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_metrics_order_idx" ON "pages_blocks_metrics" USING btree ("_order");
  CREATE INDEX "pages_blocks_metrics_parent_id_idx" ON "pages_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_metrics_path_idx" ON "pages_blocks_metrics" USING btree ("_path");
  CREATE INDEX "pages_blocks_metrics_link_link_reference_idx" ON "pages_blocks_metrics" USING btree ("link_reference_id");
  CREATE UNIQUE INDEX "pages_blocks_metrics_locales_locale_parent_id_unique" ON "pages_blocks_metrics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_metrics_items_order_idx" ON "_pages_v_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_metrics_items_parent_id_idx" ON "_pages_v_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_metrics_items_locale_idx" ON "_pages_v_blocks_metrics_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_metrics_order_idx" ON "_pages_v_blocks_metrics" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_metrics_parent_id_idx" ON "_pages_v_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_metrics_path_idx" ON "_pages_v_blocks_metrics" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_metrics_link_link_reference_idx" ON "_pages_v_blocks_metrics" USING btree ("link_reference_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_metrics_locales_locale_parent_id_unique" ON "_pages_v_blocks_metrics_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_metrics_items" CASCADE;
  DROP TABLE "pages_blocks_metrics" CASCADE;
  DROP TABLE "pages_blocks_metrics_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_metrics_items" CASCADE;
  DROP TABLE "_pages_v_blocks_metrics" CASCADE;
  DROP TABLE "_pages_v_blocks_metrics_locales" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_metrics_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_metrics_link_type";`)
}
