import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_blocks_upload_upload_collection" AS ENUM('media');
  CREATE TYPE "public"."enum_forms_integration_target" AS ENUM('none', 'monday', 'odoo');
  CREATE TYPE "public"."enum_form_submissions_sync_status" AS ENUM('pending', 'synced', 'error');
  CREATE TABLE "forms_blocks_upload_mime_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mime_type" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_upload" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"upload_collection" "enum_forms_blocks_upload_upload_collection" NOT NULL,
  	"width" numeric,
  	"max_file_size" numeric,
  	"required" boolean,
  	"multiple" boolean,
  	"external_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_upload_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_uploads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "forms_blocks_checkbox" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_country" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_state" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms" ADD COLUMN "integration_target" "enum_forms_integration_target" DEFAULT 'none';
  ALTER TABLE "forms" ADD COLUMN "external_id" varchar;
  ALTER TABLE "forms" ADD COLUMN "monday_group_id" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "sync_status" "enum_form_submissions_sync_status" DEFAULT 'pending';
  ALTER TABLE "form_submissions" ADD COLUMN "sync_error" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "synced_at" timestamp(3) with time zone;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_update" boolean DEFAULT false;
  ALTER TABLE "forms_blocks_upload_mime_types" ADD CONSTRAINT "forms_blocks_upload_mime_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_upload"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_upload" ADD CONSTRAINT "forms_blocks_upload_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_upload_locales" ADD CONSTRAINT "forms_blocks_upload_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_upload"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_uploads" ADD CONSTRAINT "form_submissions_submission_uploads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_blocks_upload_mime_types_order_idx" ON "forms_blocks_upload_mime_types" USING btree ("_order");
  CREATE INDEX "forms_blocks_upload_mime_types_parent_id_idx" ON "forms_blocks_upload_mime_types" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_upload_order_idx" ON "forms_blocks_upload" USING btree ("_order");
  CREATE INDEX "forms_blocks_upload_parent_id_idx" ON "forms_blocks_upload" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_upload_path_idx" ON "forms_blocks_upload" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_upload_locales_locale_parent_id_unique" ON "forms_blocks_upload_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "form_submissions_submission_uploads_order_idx" ON "form_submissions_submission_uploads" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_uploads_parent_id_idx" ON "form_submissions_submission_uploads" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_rels_order_idx" ON "form_submissions_rels" USING btree ("order");
  CREATE INDEX "form_submissions_rels_parent_idx" ON "form_submissions_rels" USING btree ("parent_id");
  CREATE INDEX "form_submissions_rels_path_idx" ON "form_submissions_rels" USING btree ("path");
  CREATE INDEX "form_submissions_rels_media_id_idx" ON "form_submissions_rels" USING btree ("media_id");
  ALTER TABLE "forms_blocks_number" DROP COLUMN "default_value";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "forms_blocks_upload_mime_types" CASCADE;
  DROP TABLE "forms_blocks_upload" CASCADE;
  DROP TABLE "forms_blocks_upload_locales" CASCADE;
  DROP TABLE "form_submissions_submission_uploads" CASCADE;
  DROP TABLE "form_submissions_rels" CASCADE;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "default_value" numeric;
  ALTER TABLE "forms_blocks_checkbox" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_country" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_state" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "external_id";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "external_id";
  ALTER TABLE "forms" DROP COLUMN "integration_target";
  ALTER TABLE "forms" DROP COLUMN "external_id";
  ALTER TABLE "forms" DROP COLUMN "monday_group_id";
  ALTER TABLE "form_submissions" DROP COLUMN "sync_status";
  ALTER TABLE "form_submissions" DROP COLUMN "sync_error";
  ALTER TABLE "form_submissions" DROP COLUMN "synced_at";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_update";
  DROP TYPE "public"."enum_forms_blocks_upload_upload_collection";
  DROP TYPE "public"."enum_forms_integration_target";
  DROP TYPE "public"."enum_form_submissions_sync_status";`)
}
