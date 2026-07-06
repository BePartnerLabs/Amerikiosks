import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "machines_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar
  );
  
  CREATE TABLE "machines_highlights_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "machines_capabilities_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "machines_capabilities_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "machines_dimension_diagrams" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "machines_dimension_diagrams_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_machines_v_version_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machines_v_version_highlights_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_machines_v_version_capabilities_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machines_v_version_capabilities_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_machines_v_version_dimension_diagrams" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machines_v_version_dimension_diagrams_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "machines_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_features_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_specs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_features_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "machines_specs" CASCADE;
  DROP TABLE "machines_specs_locales" CASCADE;
  DROP TABLE "machines_features" CASCADE;
  DROP TABLE "machines_features_locales" CASCADE;
  DROP TABLE "_machines_v_version_specs" CASCADE;
  DROP TABLE "_machines_v_version_specs_locales" CASCADE;
  DROP TABLE "_machines_v_version_features" CASCADE;
  DROP TABLE "_machines_v_version_features_locales" CASCADE;
  ALTER TABLE "machines" ADD COLUMN "brochure_id" integer;
  ALTER TABLE "machines" ADD COLUMN "dimensions_height" varchar;
  ALTER TABLE "machines" ADD COLUMN "dimensions_width" varchar;
  ALTER TABLE "machines" ADD COLUMN "dimensions_depth" varchar;
  ALTER TABLE "machines_locales" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "machines_locales" ADD COLUMN "highlights_eyebrow" varchar;
  ALTER TABLE "machines_locales" ADD COLUMN "highlights_heading" varchar;
  ALTER TABLE "machines_locales" ADD COLUMN "capabilities_heading" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_brochure_id" integer;
  ALTER TABLE "_machines_v" ADD COLUMN "version_dimensions_height" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_dimensions_width" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_dimensions_depth" varchar;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_highlights_eyebrow" varchar;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_highlights_heading" varchar;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_capabilities_heading" varchar;
  ALTER TABLE "machines_highlights_items" ADD CONSTRAINT "machines_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_highlights_items_locales" ADD CONSTRAINT "machines_highlights_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_highlights_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_capabilities_items" ADD CONSTRAINT "machines_capabilities_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_capabilities_items_locales" ADD CONSTRAINT "machines_capabilities_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_capabilities_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_dimension_diagrams" ADD CONSTRAINT "machines_dimension_diagrams_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_dimension_diagrams" ADD CONSTRAINT "machines_dimension_diagrams_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_dimension_diagrams_locales" ADD CONSTRAINT "machines_dimension_diagrams_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_dimension_diagrams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_highlights_items" ADD CONSTRAINT "_machines_v_version_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_highlights_items_locales" ADD CONSTRAINT "_machines_v_version_highlights_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_highlights_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_capabilities_items" ADD CONSTRAINT "_machines_v_version_capabilities_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_capabilities_items_locales" ADD CONSTRAINT "_machines_v_version_capabilities_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_capabilities_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_dimension_diagrams" ADD CONSTRAINT "_machines_v_version_dimension_diagrams_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_version_dimension_diagrams" ADD CONSTRAINT "_machines_v_version_dimension_diagrams_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_dimension_diagrams_locales" ADD CONSTRAINT "_machines_v_version_dimension_diagrams_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_dimension_diagrams"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_highlights_items_order_idx" ON "machines_highlights_items" USING btree ("_order");
  CREATE INDEX "machines_highlights_items_parent_id_idx" ON "machines_highlights_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "machines_highlights_items_locales_locale_parent_id_unique" ON "machines_highlights_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machines_capabilities_items_order_idx" ON "machines_capabilities_items" USING btree ("_order");
  CREATE INDEX "machines_capabilities_items_parent_id_idx" ON "machines_capabilities_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "machines_capabilities_items_locales_locale_parent_id_unique" ON "machines_capabilities_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machines_dimension_diagrams_order_idx" ON "machines_dimension_diagrams" USING btree ("_order");
  CREATE INDEX "machines_dimension_diagrams_parent_id_idx" ON "machines_dimension_diagrams" USING btree ("_parent_id");
  CREATE INDEX "machines_dimension_diagrams_image_idx" ON "machines_dimension_diagrams" USING btree ("image_id");
  CREATE UNIQUE INDEX "machines_dimension_diagrams_locales_locale_parent_id_unique" ON "machines_dimension_diagrams_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_highlights_items_order_idx" ON "_machines_v_version_highlights_items" USING btree ("_order");
  CREATE INDEX "_machines_v_version_highlights_items_parent_id_idx" ON "_machines_v_version_highlights_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_machines_v_version_highlights_items_locales_locale_parent_i" ON "_machines_v_version_highlights_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_capabilities_items_order_idx" ON "_machines_v_version_capabilities_items" USING btree ("_order");
  CREATE INDEX "_machines_v_version_capabilities_items_parent_id_idx" ON "_machines_v_version_capabilities_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_machines_v_version_capabilities_items_locales_locale_parent" ON "_machines_v_version_capabilities_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_dimension_diagrams_order_idx" ON "_machines_v_version_dimension_diagrams" USING btree ("_order");
  CREATE INDEX "_machines_v_version_dimension_diagrams_parent_id_idx" ON "_machines_v_version_dimension_diagrams" USING btree ("_parent_id");
  CREATE INDEX "_machines_v_version_dimension_diagrams_image_idx" ON "_machines_v_version_dimension_diagrams" USING btree ("image_id");
  CREATE UNIQUE INDEX "_machines_v_version_dimension_diagrams_locales_locale_parent" ON "_machines_v_version_dimension_diagrams_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "machines" ADD CONSTRAINT "machines_brochure_id_media_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_version_brochure_id_media_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "machines_brochure_idx" ON "machines" USING btree ("brochure_id");
  CREATE INDEX "_machines_v_version_version_brochure_idx" ON "_machines_v" USING btree ("version_brochure_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  
  CREATE TABLE "machines_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "machines_features_locales" (
  	"heading" varchar,
  	"body" varchar,
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
  
  CREATE TABLE "_machines_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machines_v_version_features_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "machines_highlights_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_highlights_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_capabilities_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_capabilities_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_dimension_diagrams" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_dimension_diagrams_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_highlights_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_highlights_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_capabilities_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_capabilities_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_dimension_diagrams" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_dimension_diagrams_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "machines_highlights_items" CASCADE;
  DROP TABLE "machines_highlights_items_locales" CASCADE;
  DROP TABLE "machines_capabilities_items" CASCADE;
  DROP TABLE "machines_capabilities_items_locales" CASCADE;
  DROP TABLE "machines_dimension_diagrams" CASCADE;
  DROP TABLE "machines_dimension_diagrams_locales" CASCADE;
  DROP TABLE "_machines_v_version_highlights_items" CASCADE;
  DROP TABLE "_machines_v_version_highlights_items_locales" CASCADE;
  DROP TABLE "_machines_v_version_capabilities_items" CASCADE;
  DROP TABLE "_machines_v_version_capabilities_items_locales" CASCADE;
  DROP TABLE "_machines_v_version_dimension_diagrams" CASCADE;
  DROP TABLE "_machines_v_version_dimension_diagrams_locales" CASCADE;
  ALTER TABLE "machines" DROP CONSTRAINT "machines_brochure_id_media_id_fk";
  
  ALTER TABLE "_machines_v" DROP CONSTRAINT "_machines_v_version_brochure_id_media_id_fk";
  
  DROP INDEX "machines_brochure_idx";
  DROP INDEX "_machines_v_version_version_brochure_idx";
  ALTER TABLE "machines_specs" ADD CONSTRAINT "machines_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_specs_locales" ADD CONSTRAINT "machines_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_features" ADD CONSTRAINT "machines_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_features" ADD CONSTRAINT "machines_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_features_locales" ADD CONSTRAINT "machines_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_specs" ADD CONSTRAINT "_machines_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_specs_locales" ADD CONSTRAINT "_machines_v_version_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_features" ADD CONSTRAINT "_machines_v_version_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_version_features" ADD CONSTRAINT "_machines_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_features_locales" ADD CONSTRAINT "_machines_v_version_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_features"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_specs_order_idx" ON "machines_specs" USING btree ("_order");
  CREATE INDEX "machines_specs_parent_id_idx" ON "machines_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "machines_specs_locales_locale_parent_id_unique" ON "machines_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machines_features_order_idx" ON "machines_features" USING btree ("_order");
  CREATE INDEX "machines_features_parent_id_idx" ON "machines_features" USING btree ("_parent_id");
  CREATE INDEX "machines_features_image_idx" ON "machines_features" USING btree ("image_id");
  CREATE UNIQUE INDEX "machines_features_locales_locale_parent_id_unique" ON "machines_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_specs_order_idx" ON "_machines_v_version_specs" USING btree ("_order");
  CREATE INDEX "_machines_v_version_specs_parent_id_idx" ON "_machines_v_version_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_machines_v_version_specs_locales_locale_parent_id_unique" ON "_machines_v_version_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_features_order_idx" ON "_machines_v_version_features" USING btree ("_order");
  CREATE INDEX "_machines_v_version_features_parent_id_idx" ON "_machines_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_machines_v_version_features_image_idx" ON "_machines_v_version_features" USING btree ("image_id");
  CREATE UNIQUE INDEX "_machines_v_version_features_locales_locale_parent_id_unique" ON "_machines_v_version_features_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "machines" DROP COLUMN "brochure_id";
  ALTER TABLE "machines" DROP COLUMN "dimensions_height";
  ALTER TABLE "machines" DROP COLUMN "dimensions_width";
  ALTER TABLE "machines" DROP COLUMN "dimensions_depth";
  ALTER TABLE "machines_locales" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "machines_locales" DROP COLUMN "highlights_eyebrow";
  ALTER TABLE "machines_locales" DROP COLUMN "highlights_heading";
  ALTER TABLE "machines_locales" DROP COLUMN "capabilities_heading";
  ALTER TABLE "_machines_v" DROP COLUMN "version_brochure_id";
  ALTER TABLE "_machines_v" DROP COLUMN "version_dimensions_height";
  ALTER TABLE "_machines_v" DROP COLUMN "version_dimensions_width";
  ALTER TABLE "_machines_v" DROP COLUMN "version_dimensions_depth";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_highlights_eyebrow";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_highlights_heading";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_capabilities_heading";`)
}
