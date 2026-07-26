import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_machines_cta_type" AS ENUM('reference', 'custom', 'modal');
  CREATE TYPE "public"."enum_machines_cta_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__machines_v_version_cta_type" AS ENUM('reference', 'custom', 'modal');
  CREATE TYPE "public"."enum__machines_v_version_cta_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "machines_locales" ALTER COLUMN "cta_label" DROP DEFAULT;
  ALTER TABLE "_machines_v_locales" ALTER COLUMN "version_cta_label" DROP DEFAULT;
  ALTER TABLE "machines" ADD COLUMN "cta_type" "enum_machines_cta_type" DEFAULT 'reference';
  ALTER TABLE "machines" ADD COLUMN "cta_new_tab" boolean;
  ALTER TABLE "machines" ADD COLUMN "cta_modal_form_id" integer;
  ALTER TABLE "machines" ADD COLUMN "cta_appearance" "enum_machines_cta_appearance" DEFAULT 'default';
  ALTER TABLE "machines_locales" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "machines_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "machines_rels" ADD COLUMN "insights_id" integer;
  ALTER TABLE "_machines_v" ADD COLUMN "version_cta_type" "enum__machines_v_version_cta_type" DEFAULT 'reference';
  ALTER TABLE "_machines_v" ADD COLUMN "version_cta_new_tab" boolean;
  ALTER TABLE "_machines_v" ADD COLUMN "version_cta_modal_form_id" integer;
  ALTER TABLE "_machines_v" ADD COLUMN "version_cta_appearance" "enum__machines_v_version_cta_appearance" DEFAULT 'default';
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_cta_url" varchar;
  ALTER TABLE "_machines_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_machines_v_rels" ADD COLUMN "insights_id" integer;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_cta_modal_form_id_forms_id_fk" FOREIGN KEY ("cta_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_version_cta_modal_form_id_forms_id_fk" FOREIGN KEY ("version_cta_modal_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "machines_cta_cta_modal_form_idx" ON "machines" USING btree ("cta_modal_form_id");
  CREATE INDEX "machines_rels_pages_id_idx" ON "machines_rels" USING btree ("pages_id");
  CREATE INDEX "machines_rels_insights_id_idx" ON "machines_rels" USING btree ("insights_id");
  CREATE INDEX "_machines_v_version_cta_version_cta_modal_form_idx" ON "_machines_v" USING btree ("version_cta_modal_form_id");
  CREATE INDEX "_machines_v_rels_pages_id_idx" ON "_machines_v_rels" USING btree ("pages_id");
  CREATE INDEX "_machines_v_rels_insights_id_idx" ON "_machines_v_rels" USING btree ("insights_id");
  ALTER TABLE "machines" DROP COLUMN "cta_url";
  ALTER TABLE "_machines_v" DROP COLUMN "version_cta_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines" DROP CONSTRAINT "machines_cta_modal_form_id_forms_id_fk";
  
  ALTER TABLE "machines_rels" DROP CONSTRAINT "machines_rels_pages_fk";
  
  ALTER TABLE "machines_rels" DROP CONSTRAINT "machines_rels_insights_fk";
  
  ALTER TABLE "_machines_v" DROP CONSTRAINT "_machines_v_version_cta_modal_form_id_forms_id_fk";
  
  ALTER TABLE "_machines_v_rels" DROP CONSTRAINT "_machines_v_rels_pages_fk";
  
  ALTER TABLE "_machines_v_rels" DROP CONSTRAINT "_machines_v_rels_insights_fk";
  
  DROP INDEX "machines_cta_cta_modal_form_idx";
  DROP INDEX "machines_rels_pages_id_idx";
  DROP INDEX "machines_rels_insights_id_idx";
  DROP INDEX "_machines_v_version_cta_version_cta_modal_form_idx";
  DROP INDEX "_machines_v_rels_pages_id_idx";
  DROP INDEX "_machines_v_rels_insights_id_idx";
  ALTER TABLE "machines_locales" ALTER COLUMN "cta_label" SET DEFAULT 'Request a quote';
  ALTER TABLE "_machines_v_locales" ALTER COLUMN "version_cta_label" SET DEFAULT 'Request a quote';
  ALTER TABLE "machines" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "_machines_v" ADD COLUMN "version_cta_url" varchar;
  ALTER TABLE "machines" DROP COLUMN "cta_type";
  ALTER TABLE "machines" DROP COLUMN "cta_new_tab";
  ALTER TABLE "machines" DROP COLUMN "cta_modal_form_id";
  ALTER TABLE "machines" DROP COLUMN "cta_appearance";
  ALTER TABLE "machines_locales" DROP COLUMN "cta_url";
  ALTER TABLE "machines_rels" DROP COLUMN "pages_id";
  ALTER TABLE "machines_rels" DROP COLUMN "insights_id";
  ALTER TABLE "_machines_v" DROP COLUMN "version_cta_type";
  ALTER TABLE "_machines_v" DROP COLUMN "version_cta_new_tab";
  ALTER TABLE "_machines_v" DROP COLUMN "version_cta_modal_form_id";
  ALTER TABLE "_machines_v" DROP COLUMN "version_cta_appearance";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_cta_url";
  ALTER TABLE "_machines_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_machines_v_rels" DROP COLUMN "insights_id";
  DROP TYPE "public"."enum_machines_cta_type";
  DROP TYPE "public"."enum_machines_cta_appearance";
  DROP TYPE "public"."enum__machines_v_version_cta_type";
  DROP TYPE "public"."enum__machines_v_version_cta_appearance";`)
}
