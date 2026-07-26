import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "machines_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "machines_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_machines_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machines_v_version_specs_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "machines_capabilities_items" ADD COLUMN "image_id" integer;
  ALTER TABLE "machines_capabilities_items_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "_machines_v_version_capabilities_items" ADD COLUMN "image_id" integer;
  ALTER TABLE "_machines_v_version_capabilities_items_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "machines_specs" ADD CONSTRAINT "machines_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_specs_locales" ADD CONSTRAINT "machines_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_specs" ADD CONSTRAINT "_machines_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_specs_locales" ADD CONSTRAINT "_machines_v_version_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_specs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_specs_order_idx" ON "machines_specs" USING btree ("_order");
  CREATE INDEX "machines_specs_parent_id_idx" ON "machines_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "machines_specs_locales_locale_parent_id_unique" ON "machines_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_specs_order_idx" ON "_machines_v_version_specs" USING btree ("_order");
  CREATE INDEX "_machines_v_version_specs_parent_id_idx" ON "_machines_v_version_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_machines_v_version_specs_locales_locale_parent_id_unique" ON "_machines_v_version_specs_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "machines_capabilities_items" ADD CONSTRAINT "machines_capabilities_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_version_capabilities_items" ADD CONSTRAINT "_machines_v_version_capabilities_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "machines_capabilities_items_image_idx" ON "machines_capabilities_items" USING btree ("image_id");
  CREATE INDEX "_machines_v_version_capabilities_items_image_idx" ON "_machines_v_version_capabilities_items" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_specs_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "machines_specs" CASCADE;
  DROP TABLE "machines_specs_locales" CASCADE;
  DROP TABLE "_machines_v_version_specs" CASCADE;
  DROP TABLE "_machines_v_version_specs_locales" CASCADE;
  ALTER TABLE "machines_capabilities_items" DROP CONSTRAINT "machines_capabilities_items_image_id_media_id_fk";
  
  ALTER TABLE "_machines_v_version_capabilities_items" DROP CONSTRAINT "_machines_v_version_capabilities_items_image_id_media_id_fk";
  
  DROP INDEX "machines_capabilities_items_image_idx";
  DROP INDEX "_machines_v_version_capabilities_items_image_idx";
  ALTER TABLE "machines_capabilities_items" DROP COLUMN "image_id";
  ALTER TABLE "machines_capabilities_items_locales" DROP COLUMN "heading";
  ALTER TABLE "_machines_v_version_capabilities_items" DROP COLUMN "image_id";
  ALTER TABLE "_machines_v_version_capabilities_items_locales" DROP COLUMN "heading";`)
}
