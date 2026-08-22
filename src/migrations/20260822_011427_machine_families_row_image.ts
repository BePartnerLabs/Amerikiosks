import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machine_families" ADD COLUMN "row_image_id" integer;
  ALTER TABLE "_machine_families_v" ADD COLUMN "version_row_image_id" integer;
  ALTER TABLE "machine_families" ADD CONSTRAINT "machine_families_row_image_id_media_id_fk" FOREIGN KEY ("row_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_machine_families_v" ADD CONSTRAINT "_machine_families_v_version_row_image_id_media_id_fk" FOREIGN KEY ("version_row_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "machine_families_row_image_idx" ON "machine_families" USING btree ("row_image_id");
  CREATE INDEX "_machine_families_v_version_version_row_image_idx" ON "_machine_families_v" USING btree ("version_row_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machine_families" DROP CONSTRAINT "machine_families_row_image_id_media_id_fk";
  
  ALTER TABLE "_machine_families_v" DROP CONSTRAINT "_machine_families_v_version_row_image_id_media_id_fk";
  
  DROP INDEX "machine_families_row_image_idx";
  DROP INDEX "_machine_families_v_version_version_row_image_idx";
  ALTER TABLE "machine_families" DROP COLUMN "row_image_id";
  ALTER TABLE "_machine_families_v" DROP COLUMN "version_row_image_id";`)
}
