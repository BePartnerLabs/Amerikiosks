import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_blocks_text_value_type" AS ENUM('text', 'phone', 'website');
  CREATE TYPE "public"."enum_forms_blocks_upload_accepted_file_types" AS ENUM('image', 'pdf');
  CREATE TABLE "forms_blocks_upload_accepted_file_types" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_forms_blocks_upload_accepted_file_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "forms_blocks_email" ADD COLUMN "autocomplete" varchar;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "autocomplete" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "autocomplete" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "value_type" "enum_forms_blocks_text_value_type" DEFAULT 'text';
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "autocomplete" varchar;
  ALTER TABLE "forms_blocks_upload_accepted_file_types" ADD CONSTRAINT "forms_blocks_upload_accepted_file_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forms_blocks_upload"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_blocks_upload_accepted_file_types_order_idx" ON "forms_blocks_upload_accepted_file_types" USING btree ("order");
  CREATE INDEX "forms_blocks_upload_accepted_file_types_parent_idx" ON "forms_blocks_upload_accepted_file_types" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "forms_blocks_upload_accepted_file_types" CASCADE;
  ALTER TABLE "forms_blocks_email" DROP COLUMN "autocomplete";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "autocomplete";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "autocomplete";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "value_type";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "autocomplete";
  DROP TYPE "public"."enum_forms_blocks_text_value_type";
  DROP TYPE "public"."enum_forms_blocks_upload_accepted_file_types";`)
}
