import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "form_submissions_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar,
  	"key" varchar,
  	"filename" varchar,
  	"mime_type" varchar
  );
  
  ALTER TABLE "form_submissions_attachments" ADD CONSTRAINT "form_submissions_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "form_submissions_attachments_order_idx" ON "form_submissions_attachments" USING btree ("_order");
  CREATE INDEX "form_submissions_attachments_parent_id_idx" ON "form_submissions_attachments" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "form_submissions_attachments" CASCADE;`)
}
