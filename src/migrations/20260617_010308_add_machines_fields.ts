import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "machines_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
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
  
  CREATE TABLE "machines_rotation_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "_machines_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
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
  
  CREATE TABLE "_machines_v_version_rotation_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "machines" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "machines" ADD COLUMN "use_rotation_hero" boolean DEFAULT false;
  ALTER TABLE "machines_locales" ADD COLUMN "cta_label" varchar DEFAULT 'Request a quote';
  ALTER TABLE "_machines_v" ADD COLUMN "version_cta_url" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_use_rotation_hero" boolean DEFAULT false;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_cta_label" varchar DEFAULT 'Request a quote';
  ALTER TABLE "machines_gallery" ADD CONSTRAINT "machines_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_gallery" ADD CONSTRAINT "machines_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_specs" ADD CONSTRAINT "machines_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_specs_locales" ADD CONSTRAINT "machines_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_features" ADD CONSTRAINT "machines_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_features" ADD CONSTRAINT "machines_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_features_locales" ADD CONSTRAINT "machines_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_rotation_frames" ADD CONSTRAINT "machines_rotation_frames_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_rotation_frames" ADD CONSTRAINT "machines_rotation_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_gallery" ADD CONSTRAINT "_machines_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_version_gallery" ADD CONSTRAINT "_machines_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_specs" ADD CONSTRAINT "_machines_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_specs_locales" ADD CONSTRAINT "_machines_v_version_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_features" ADD CONSTRAINT "_machines_v_version_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_version_features" ADD CONSTRAINT "_machines_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_features_locales" ADD CONSTRAINT "_machines_v_version_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v_version_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_rotation_frames" ADD CONSTRAINT "_machines_v_version_rotation_frames_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_version_rotation_frames" ADD CONSTRAINT "_machines_v_version_rotation_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_gallery_order_idx" ON "machines_gallery" USING btree ("_order");
  CREATE INDEX "machines_gallery_parent_id_idx" ON "machines_gallery" USING btree ("_parent_id");
  CREATE INDEX "machines_gallery_image_idx" ON "machines_gallery" USING btree ("image_id");
  CREATE INDEX "machines_specs_order_idx" ON "machines_specs" USING btree ("_order");
  CREATE INDEX "machines_specs_parent_id_idx" ON "machines_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "machines_specs_locales_locale_parent_id_unique" ON "machines_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machines_features_order_idx" ON "machines_features" USING btree ("_order");
  CREATE INDEX "machines_features_parent_id_idx" ON "machines_features" USING btree ("_parent_id");
  CREATE INDEX "machines_features_image_idx" ON "machines_features" USING btree ("image_id");
  CREATE UNIQUE INDEX "machines_features_locales_locale_parent_id_unique" ON "machines_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machines_rotation_frames_order_idx" ON "machines_rotation_frames" USING btree ("_order");
  CREATE INDEX "machines_rotation_frames_parent_id_idx" ON "machines_rotation_frames" USING btree ("_parent_id");
  CREATE INDEX "machines_rotation_frames_image_idx" ON "machines_rotation_frames" USING btree ("image_id");
  CREATE INDEX "_machines_v_version_gallery_order_idx" ON "_machines_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_machines_v_version_gallery_parent_id_idx" ON "_machines_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_machines_v_version_gallery_image_idx" ON "_machines_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_machines_v_version_specs_order_idx" ON "_machines_v_version_specs" USING btree ("_order");
  CREATE INDEX "_machines_v_version_specs_parent_id_idx" ON "_machines_v_version_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_machines_v_version_specs_locales_locale_parent_id_unique" ON "_machines_v_version_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_features_order_idx" ON "_machines_v_version_features" USING btree ("_order");
  CREATE INDEX "_machines_v_version_features_parent_id_idx" ON "_machines_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_machines_v_version_features_image_idx" ON "_machines_v_version_features" USING btree ("image_id");
  CREATE UNIQUE INDEX "_machines_v_version_features_locales_locale_parent_id_unique" ON "_machines_v_version_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_rotation_frames_order_idx" ON "_machines_v_version_rotation_frames" USING btree ("_order");
  CREATE INDEX "_machines_v_version_rotation_frames_parent_id_idx" ON "_machines_v_version_rotation_frames" USING btree ("_parent_id");
  CREATE INDEX "_machines_v_version_rotation_frames_image_idx" ON "_machines_v_version_rotation_frames" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "machines_gallery" CASCADE;
  DROP TABLE "machines_specs" CASCADE;
  DROP TABLE "machines_specs_locales" CASCADE;
  DROP TABLE "machines_features" CASCADE;
  DROP TABLE "machines_features_locales" CASCADE;
  DROP TABLE "machines_rotation_frames" CASCADE;
  DROP TABLE "_machines_v_version_gallery" CASCADE;
  DROP TABLE "_machines_v_version_specs" CASCADE;
  DROP TABLE "_machines_v_version_specs_locales" CASCADE;
  DROP TABLE "_machines_v_version_features" CASCADE;
  DROP TABLE "_machines_v_version_features_locales" CASCADE;
  DROP TABLE "_machines_v_version_rotation_frames" CASCADE;
  ALTER TABLE "machines" DROP COLUMN "cta_url";
  ALTER TABLE "machines" DROP COLUMN "use_rotation_hero";
  ALTER TABLE "machines_locales" DROP COLUMN "cta_label";
  ALTER TABLE "_machines_v" DROP COLUMN "version_cta_url";
  ALTER TABLE "_machines_v" DROP COLUMN "version_use_rotation_hero";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_cta_label";`)
}
