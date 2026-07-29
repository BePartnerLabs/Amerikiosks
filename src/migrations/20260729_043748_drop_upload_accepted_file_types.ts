import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "forms_blocks_upload_accepted_file_types" CASCADE;
  DROP TYPE "public"."enum_forms_blocks_upload_accepted_file_types";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_blocks_upload_accepted_file_types" AS ENUM('image', 'pdf');
  CREATE TABLE "forms_blocks_upload_accepted_file_types" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_forms_blocks_upload_accepted_file_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "forms_blocks_upload_accepted_file_types" ADD CONSTRAINT "forms_blocks_upload_accepted_file_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forms_blocks_upload"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_blocks_upload_accepted_file_types_order_idx" ON "forms_blocks_upload_accepted_file_types" USING btree ("order");
  CREATE INDEX "forms_blocks_upload_accepted_file_types_parent_idx" ON "forms_blocks_upload_accepted_file_types" USING btree ("parent_id");`)
}
