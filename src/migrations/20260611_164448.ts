import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_machines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__machines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__machines_v_published_locale" AS ENUM('en', 'es');
  CREATE TABLE "machines_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "machines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_machines_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "machines_locales" (
  	"name" varchar,
  	"tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_machines_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_machines_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__machines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__machines_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_machines_v_locales" (
  	"version_name" varchar,
  	"version_tagline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machines_id" integer;
  ALTER TABLE "machines_tags" ADD CONSTRAINT "machines_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_locales" ADD CONSTRAINT "machines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_version_tags" ADD CONSTRAINT "_machines_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_parent_id_machines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."machines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_locales" ADD CONSTRAINT "_machines_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_tags_order_idx" ON "machines_tags" USING btree ("_order");
  CREATE INDEX "machines_tags_parent_id_idx" ON "machines_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "machines_slug_idx" ON "machines" USING btree ("slug");
  CREATE INDEX "machines_image_idx" ON "machines" USING btree ("image_id");
  CREATE INDEX "machines_updated_at_idx" ON "machines" USING btree ("updated_at");
  CREATE INDEX "machines_created_at_idx" ON "machines" USING btree ("created_at");
  CREATE INDEX "machines__status_idx" ON "machines" USING btree ("_status");
  CREATE UNIQUE INDEX "machines_locales_locale_parent_id_unique" ON "machines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_machines_v_version_tags_order_idx" ON "_machines_v_version_tags" USING btree ("_order");
  CREATE INDEX "_machines_v_version_tags_parent_id_idx" ON "_machines_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_machines_v_parent_idx" ON "_machines_v" USING btree ("parent_id");
  CREATE INDEX "_machines_v_version_version_slug_idx" ON "_machines_v" USING btree ("version_slug");
  CREATE INDEX "_machines_v_version_version_image_idx" ON "_machines_v" USING btree ("version_image_id");
  CREATE INDEX "_machines_v_version_version_updated_at_idx" ON "_machines_v" USING btree ("version_updated_at");
  CREATE INDEX "_machines_v_version_version_created_at_idx" ON "_machines_v" USING btree ("version_created_at");
  CREATE INDEX "_machines_v_version_version__status_idx" ON "_machines_v" USING btree ("version__status");
  CREATE INDEX "_machines_v_created_at_idx" ON "_machines_v" USING btree ("created_at");
  CREATE INDEX "_machines_v_updated_at_idx" ON "_machines_v" USING btree ("updated_at");
  CREATE INDEX "_machines_v_snapshot_idx" ON "_machines_v" USING btree ("snapshot");
  CREATE INDEX "_machines_v_published_locale_idx" ON "_machines_v" USING btree ("published_locale");
  CREATE INDEX "_machines_v_latest_idx" ON "_machines_v" USING btree ("latest");
  CREATE INDEX "_machines_v_autosave_idx" ON "_machines_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_machines_v_locales_locale_parent_id_unique" ON "_machines_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machines_fk" FOREIGN KEY ("machines_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_machines_id_idx" ON "payload_locked_documents_rels" USING btree ("machines_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "machines_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_machines_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "machines_tags" CASCADE;
  DROP TABLE "machines" CASCADE;
  DROP TABLE "machines_locales" CASCADE;
  DROP TABLE "_machines_v_version_tags" CASCADE;
  DROP TABLE "_machines_v" CASCADE;
  DROP TABLE "_machines_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machines_fk";
  
  DROP INDEX "payload_locked_documents_rels_machines_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machines_id";
  DROP TYPE "public"."enum_machines_status";
  DROP TYPE "public"."enum__machines_v_version_status";
  DROP TYPE "public"."enum__machines_v_published_locale";`)
}
