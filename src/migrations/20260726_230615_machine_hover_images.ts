import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines" ADD COLUMN "hover_image_id" integer;
  ALTER TABLE "_machines_v" ADD COLUMN "version_hover_image_id" integer;
  ALTER TABLE "machine_families" ADD COLUMN "hover_thumbnail_id" integer;
  ALTER TABLE "_machine_families_v" ADD COLUMN "version_hover_thumbnail_id" integer;
  ALTER TABLE "machines" ADD CONSTRAINT "machines_hover_image_id_media_id_fk" FOREIGN KEY ("hover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machines_v" ADD CONSTRAINT "_machines_v_version_hover_image_id_media_id_fk" FOREIGN KEY ("version_hover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "machine_families" ADD CONSTRAINT "machine_families_hover_thumbnail_id_media_id_fk" FOREIGN KEY ("hover_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machine_families_v" ADD CONSTRAINT "_machine_families_v_version_hover_thumbnail_id_media_id_fk" FOREIGN KEY ("version_hover_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "machines_hover_image_idx" ON "machines" USING btree ("hover_image_id");
  CREATE INDEX "_machines_v_version_version_hover_image_idx" ON "_machines_v" USING btree ("version_hover_image_id");
  CREATE INDEX "machine_families_hover_thumbnail_idx" ON "machine_families" USING btree ("hover_thumbnail_id");
  CREATE INDEX "_machine_families_v_version_version_hover_thumbnail_idx" ON "_machine_families_v" USING btree ("version_hover_thumbnail_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machines" DROP CONSTRAINT "machines_hover_image_id_media_id_fk";
  
  ALTER TABLE "_machines_v" DROP CONSTRAINT "_machines_v_version_hover_image_id_media_id_fk";
  
  ALTER TABLE "machine_families" DROP CONSTRAINT "machine_families_hover_thumbnail_id_media_id_fk";
  
  ALTER TABLE "_machine_families_v" DROP CONSTRAINT "_machine_families_v_version_hover_thumbnail_id_media_id_fk";
  
  DROP INDEX "machines_hover_image_idx";
  DROP INDEX "_machines_v_version_version_hover_image_idx";
  DROP INDEX "machine_families_hover_thumbnail_idx";
  DROP INDEX "_machine_families_v_version_version_hover_thumbnail_idx";
  ALTER TABLE "machines" DROP COLUMN "hover_image_id";
  ALTER TABLE "_machines_v" DROP COLUMN "version_hover_image_id";
  ALTER TABLE "machine_families" DROP COLUMN "hover_thumbnail_id";
  ALTER TABLE "_machine_families_v" DROP COLUMN "version_hover_thumbnail_id";`)
}
