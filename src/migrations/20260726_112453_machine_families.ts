import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_machine_families_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__machine_families_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__machine_families_v_published_locale" AS ENUM('en', 'es');
  CREATE TABLE "machine_families_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "machine_families_highlights_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "machine_families" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"thumbnail_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_machine_families_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "machine_families_locales" (
  	"name" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"cta_label" varchar DEFAULT 'Know more',
  	"highlights_eyebrow" varchar,
  	"highlights_heading" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_machine_families_v_version_highlights_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machine_families_v_version_highlights_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_machine_families_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_thumbnail_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__machine_families_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__machine_families_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_machine_families_v_locales" (
  	"version_name" varchar,
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_cta_label" varchar DEFAULT 'Know more',
  	"version_highlights_eyebrow" varchar,
  	"version_highlights_heading" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "machine_installations_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "machine_installations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_id" integer NOT NULL,
  	"machine_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "machine_installations_locales" (
  	"location" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "machines" ADD COLUMN "family_id" integer;
  ALTER TABLE "_machines_v" ADD COLUMN "version_family_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machine_families_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machine_installations_id" integer;
  ALTER TABLE "machine_families_highlights_items" ADD CONSTRAINT "machine_families_highlights_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_families_highlights_items" ADD CONSTRAINT "machine_families_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machine_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_families_highlights_items_locales" ADD CONSTRAINT "machine_families_highlights_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machine_families_highlights_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_families" ADD CONSTRAINT "machine_families_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_families_locales" ADD CONSTRAINT "machine_families_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_families_locales" ADD CONSTRAINT "machine_families_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machine_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machine_families_v_version_highlights_items" ADD CONSTRAINT "_machine_families_v_version_highlights_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machine_families_v_version_highlights_items" ADD CONSTRAINT "_machine_families_v_version_highlights_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machine_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machine_families_v_version_highlights_items_locales" ADD CONSTRAINT "_machine_families_v_version_highlights_items_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machine_families_v_version_highlights_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machine_families_v" ADD CONSTRAINT "_machine_families_v_parent_id_machine_families_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."machine_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machine_families_v" ADD CONSTRAINT "_machine_families_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machine_families_v_locales" ADD CONSTRAINT "_machine_families_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machine_families_v_locales" ADD CONSTRAINT "_machine_families_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machine_families_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_installations_photos" ADD CONSTRAINT "machine_installations_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_installations_photos" ADD CONSTRAINT "machine_installations_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machine_installations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machine_installations" ADD CONSTRAINT "machine_installations_client_id_partners_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_installations" ADD CONSTRAINT "machine_installations_machine_id_machines_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_installations_locales" ADD CONSTRAINT "machine_installations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machine_installations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machine_families_highlights_items_order_idx" ON "machine_families_highlights_items" USING btree ("_order");
  CREATE INDEX "machine_families_highlights_items_parent_id_idx" ON "machine_families_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "machine_families_highlights_items_image_idx" ON "machine_families_highlights_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "machine_families_highlights_items_locales_locale_parent_id_u" ON "machine_families_highlights_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "machine_families_slug_idx" ON "machine_families" USING btree ("slug");
  CREATE INDEX "machine_families_thumbnail_idx" ON "machine_families" USING btree ("thumbnail_id");
  CREATE INDEX "machine_families_updated_at_idx" ON "machine_families" USING btree ("updated_at");
  CREATE INDEX "machine_families_created_at_idx" ON "machine_families" USING btree ("created_at");
  CREATE INDEX "machine_families__status_idx" ON "machine_families" USING btree ("_status");
  CREATE INDEX "machine_families_meta_meta_image_idx" ON "machine_families_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "machine_families_locales_locale_parent_id_unique" ON "machine_families_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machine_families_v_version_highlights_items_order_idx" ON "_machine_families_v_version_highlights_items" USING btree ("_order");
  CREATE INDEX "_machine_families_v_version_highlights_items_parent_id_idx" ON "_machine_families_v_version_highlights_items" USING btree ("_parent_id");
  CREATE INDEX "_machine_families_v_version_highlights_items_image_idx" ON "_machine_families_v_version_highlights_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "_machine_families_v_version_highlights_items_locales_locale_" ON "_machine_families_v_version_highlights_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machine_families_v_parent_idx" ON "_machine_families_v" USING btree ("parent_id");
  CREATE INDEX "_machine_families_v_version_version_slug_idx" ON "_machine_families_v" USING btree ("version_slug");
  CREATE INDEX "_machine_families_v_version_version_thumbnail_idx" ON "_machine_families_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_machine_families_v_version_version_updated_at_idx" ON "_machine_families_v" USING btree ("version_updated_at");
  CREATE INDEX "_machine_families_v_version_version_created_at_idx" ON "_machine_families_v" USING btree ("version_created_at");
  CREATE INDEX "_machine_families_v_version_version__status_idx" ON "_machine_families_v" USING btree ("version__status");
  CREATE INDEX "_machine_families_v_created_at_idx" ON "_machine_families_v" USING btree ("created_at");
  CREATE INDEX "_machine_families_v_updated_at_idx" ON "_machine_families_v" USING btree ("updated_at");
  CREATE INDEX "_machine_families_v_snapshot_idx" ON "_machine_families_v" USING btree ("snapshot");
  CREATE INDEX "_machine_families_v_published_locale_idx" ON "_machine_families_v" USING btree ("published_locale");
  CREATE INDEX "_machine_families_v_latest_idx" ON "_machine_families_v" USING btree ("latest");
  CREATE INDEX "_machine_families_v_autosave_idx" ON "_machine_families_v" USING btree ("autosave");
  CREATE INDEX "_machine_families_v_version_meta_version_meta_image_idx" ON "_machine_families_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_machine_families_v_locales_locale_parent_id_unique" ON "_machine_families_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "machine_installations_photos_order_idx" ON "machine_installations_photos" USING btree ("_order");
  CREATE INDEX "machine_installations_photos_parent_id_idx" ON "machine_installations_photos" USING btree ("_parent_id");
  CREATE INDEX "machine_installations_photos_image_idx" ON "machine_installations_photos" USING btree ("image_id");
  CREATE INDEX "machine_installations_client_idx" ON "machine_installations" USING btree ("client_id");
  CREATE INDEX "machine_installations_machine_idx" ON "machine_installations" USING btree ("machine_id");
  CREATE INDEX "machine_installations_updated_at_idx" ON "machine_installations" USING btree ("updated_at");
  CREATE INDEX "machine_installations_created_at_idx" ON "machine_installations" USING btree ("created_at");
  CREATE UNIQUE INDEX "machine_installations_locales_locale_parent_id_unique" ON "machine_installations_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "machines" ADD CONSTRAINT "machines_family_id_machine_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."machine_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_version_family_id_machine_families_id_fk" FOREIGN KEY ("version_family_id") REFERENCES "public"."machine_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machine_families_fk" FOREIGN KEY ("machine_families_id") REFERENCES "public"."machine_families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machine_installations_fk" FOREIGN KEY ("machine_installations_id") REFERENCES "public"."machine_installations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_family_idx" ON "machines" USING btree ("family_id");
  CREATE INDEX "_machines_v_version_version_family_idx" ON "_machines_v" USING btree ("version_family_id");
  CREATE INDEX "payload_locked_documents_rels_machine_families_id_idx" ON "payload_locked_documents_rels" USING btree ("machine_families_id");
  CREATE INDEX "payload_locked_documents_rels_machine_installations_id_idx" ON "payload_locked_documents_rels" USING btree ("machine_installations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machine_families_highlights_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_families_highlights_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_families" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_families_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machine_families_v_version_highlights_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machine_families_v_version_highlights_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machine_families_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machine_families_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_installations_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_installations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machine_installations_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "machine_families_highlights_items" CASCADE;
  DROP TABLE "machine_families_highlights_items_locales" CASCADE;
  DROP TABLE "machine_families" CASCADE;
  DROP TABLE "machine_families_locales" CASCADE;
  DROP TABLE "_machine_families_v_version_highlights_items" CASCADE;
  DROP TABLE "_machine_families_v_version_highlights_items_locales" CASCADE;
  DROP TABLE "_machine_families_v" CASCADE;
  DROP TABLE "_machine_families_v_locales" CASCADE;
  DROP TABLE "machine_installations_photos" CASCADE;
  DROP TABLE "machine_installations" CASCADE;
  DROP TABLE "machine_installations_locales" CASCADE;
  ALTER TABLE "machines" DROP CONSTRAINT "machines_family_id_machine_families_id_fk";
  
  ALTER TABLE "_machines_v" DROP CONSTRAINT "_machines_v_version_family_id_machine_families_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machine_families_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machine_installations_fk";
  
  DROP INDEX "machines_family_idx";
  DROP INDEX "_machines_v_version_version_family_idx";
  DROP INDEX "payload_locked_documents_rels_machine_families_id_idx";
  DROP INDEX "payload_locked_documents_rels_machine_installations_id_idx";
  ALTER TABLE "machines" DROP COLUMN "family_id";
  ALTER TABLE "_machines_v" DROP COLUMN "version_family_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machine_families_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machine_installations_id";
  DROP TYPE "public"."enum_machine_families_status";
  DROP TYPE "public"."enum__machine_families_v_version_status";
  DROP TYPE "public"."enum__machine_families_v_published_locale";`)
}
