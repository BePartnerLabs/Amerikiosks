import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "machines_locales" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "machines_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_machines_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "projects_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_projects_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "machines_locales" ADD CONSTRAINT "machines_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v_locales" ADD CONSTRAINT "_machines_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "machines_meta_meta_image_idx" ON "machines_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "_machines_v_version_meta_version_meta_image_idx" ON "_machines_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v_locales" USING btree ("version_meta_image_id","_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines_locales" DROP CONSTRAINT "machines_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "_machines_v_locales" DROP CONSTRAINT "_machines_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "projects_locales" DROP CONSTRAINT "projects_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "_projects_v_locales" DROP CONSTRAINT "_projects_v_locales_version_meta_image_id_media_id_fk";
  
  DROP INDEX "machines_meta_meta_image_idx";
  DROP INDEX "_machines_v_version_meta_version_meta_image_idx";
  DROP INDEX "projects_meta_meta_image_idx";
  DROP INDEX "_projects_v_version_meta_version_meta_image_idx";
  ALTER TABLE "machines_locales" DROP COLUMN "meta_title";
  ALTER TABLE "machines_locales" DROP COLUMN "meta_image_id";
  ALTER TABLE "machines_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_machines_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "projects_locales" DROP COLUMN "meta_title";
  ALTER TABLE "projects_locales" DROP COLUMN "meta_image_id";
  ALTER TABLE "projects_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_projects_v_locales" DROP COLUMN "version_meta_description";`)
}
