import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_card_grid_items" ADD CONSTRAINT "pages_blocks_card_grid_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD CONSTRAINT "_pages_v_blocks_card_grid_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_card_grid_items_media_idx" ON "pages_blocks_card_grid_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_card_grid_items_media_idx" ON "_pages_v_blocks_card_grid_items" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_card_grid_items" DROP CONSTRAINT "pages_blocks_card_grid_items_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP CONSTRAINT "_pages_v_blocks_card_grid_items_media_id_media_id_fk";
  
  DROP INDEX "pages_blocks_card_grid_items_media_idx";
  DROP INDEX "_pages_v_blocks_card_grid_items_media_idx";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "media_id";`)
}
