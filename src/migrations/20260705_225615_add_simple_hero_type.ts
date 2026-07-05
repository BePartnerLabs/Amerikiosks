import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'simple';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'simple';
  CREATE TABLE "pages_blocks_machines_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"items_per_page" numeric DEFAULT 12,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_machines_listing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"items_per_page" numeric DEFAULT 12,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_machines_listing" ADD CONSTRAINT "pages_blocks_machines_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_machines_listing" ADD CONSTRAINT "_pages_v_blocks_machines_listing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_machines_listing_order_idx" ON "pages_blocks_machines_listing" USING btree ("_order");
  CREATE INDEX "pages_blocks_machines_listing_parent_id_idx" ON "pages_blocks_machines_listing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_machines_listing_path_idx" ON "pages_blocks_machines_listing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_machines_listing_order_idx" ON "_pages_v_blocks_machines_listing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_machines_listing_parent_id_idx" ON "_pages_v_blocks_machines_listing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_machines_listing_path_idx" ON "_pages_v_blocks_machines_listing" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_machines_listing" CASCADE;
  DROP TABLE "_pages_v_blocks_machines_listing" CASCADE;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";`)
}
