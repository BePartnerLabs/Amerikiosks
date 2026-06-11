import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_status" RENAME TO "enum_insights_status";
  ALTER TYPE "public"."enum__posts_v_version_status" RENAME TO "enum__insights_v_version_status";
  ALTER TYPE "public"."enum__posts_v_published_locale" RENAME TO "enum__insights_v_published_locale";
  ALTER TABLE "posts_populated_authors" RENAME TO "insights_populated_authors";
  ALTER TABLE "posts" RENAME TO "insights";
  ALTER TABLE "posts_locales" RENAME TO "insights_locales";
  ALTER TABLE "posts_rels" RENAME TO "insights_rels";
  ALTER TABLE "_posts_v_version_populated_authors" RENAME TO "_insights_v_version_populated_authors";
  ALTER TABLE "_posts_v" RENAME TO "_insights_v";
  ALTER TABLE "_posts_v_locales" RENAME TO "_insights_v_locales";
  ALTER TABLE "_posts_v_rels" RENAME TO "_insights_v_rels";
  ALTER TABLE "pages_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "_pages_v_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "insights_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "_insights_v_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "redirects_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "search_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "header_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "footer_rels" RENAME COLUMN "posts_id" TO "insights_id";
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_posts_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_posts_fk";
  
  ALTER TABLE "insights_populated_authors" DROP CONSTRAINT "posts_populated_authors_parent_id_fk";
  
  ALTER TABLE "insights" DROP CONSTRAINT "posts_hero_image_id_media_id_fk";
  
  ALTER TABLE "insights_locales" DROP CONSTRAINT "posts_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "insights_locales" DROP CONSTRAINT "posts_locales_parent_id_fk";
  
  ALTER TABLE "insights_rels" DROP CONSTRAINT "posts_rels_parent_fk";
  
  ALTER TABLE "insights_rels" DROP CONSTRAINT "posts_rels_posts_fk";
  
  ALTER TABLE "insights_rels" DROP CONSTRAINT "posts_rels_categories_fk";
  
  ALTER TABLE "insights_rels" DROP CONSTRAINT "posts_rels_users_fk";
  
  ALTER TABLE "_insights_v_version_populated_authors" DROP CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk";
  
  ALTER TABLE "_insights_v" DROP CONSTRAINT "_posts_v_parent_id_posts_id_fk";
  
  ALTER TABLE "_insights_v" DROP CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "_insights_v_locales" DROP CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "_insights_v_locales" DROP CONSTRAINT "_posts_v_locales_parent_id_fk";
  
  ALTER TABLE "_insights_v_rels" DROP CONSTRAINT "_posts_v_rels_parent_fk";
  
  ALTER TABLE "_insights_v_rels" DROP CONSTRAINT "_posts_v_rels_posts_fk";
  
  ALTER TABLE "_insights_v_rels" DROP CONSTRAINT "_posts_v_rels_categories_fk";
  
  ALTER TABLE "_insights_v_rels" DROP CONSTRAINT "_posts_v_rels_users_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_posts_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_posts_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_posts_fk";
  
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  UPDATE "pages_blocks_archive" SET "relation_to" = 'insights' WHERE "relation_to" = 'posts';
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'insights'::text;
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('insights');
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'insights'::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum_pages_blocks_archive_relation_to" USING "relation_to"::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  UPDATE "_pages_v_blocks_archive" SET "relation_to" = 'insights' WHERE "relation_to" = 'posts';
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'insights'::text;
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('insights');
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'insights'::"public"."enum__pages_v_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum__pages_v_blocks_archive_relation_to" USING "relation_to"::"public"."enum__pages_v_blocks_archive_relation_to";
  DROP INDEX "pages_rels_posts_id_idx";
  DROP INDEX "_pages_v_rels_posts_id_idx";
  DROP INDEX "posts_populated_authors_order_idx";
  DROP INDEX "posts_populated_authors_parent_id_idx";
  DROP INDEX "posts_hero_image_idx";
  DROP INDEX "posts_updated_at_idx";
  DROP INDEX "posts_created_at_idx";
  DROP INDEX "posts__status_idx";
  DROP INDEX "posts_meta_meta_image_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "posts_locales_locale_parent_id_unique";
  DROP INDEX "posts_rels_order_idx";
  DROP INDEX "posts_rels_parent_idx";
  DROP INDEX "posts_rels_path_idx";
  DROP INDEX "posts_rels_posts_id_idx";
  DROP INDEX "posts_rels_categories_id_idx";
  DROP INDEX "posts_rels_users_id_idx";
  DROP INDEX "_posts_v_version_populated_authors_order_idx";
  DROP INDEX "_posts_v_version_populated_authors_parent_id_idx";
  DROP INDEX "_posts_v_parent_idx";
  DROP INDEX "_posts_v_version_version_hero_image_idx";
  DROP INDEX "_posts_v_version_version_updated_at_idx";
  DROP INDEX "_posts_v_version_version_created_at_idx";
  DROP INDEX "_posts_v_version_version__status_idx";
  DROP INDEX "_posts_v_created_at_idx";
  DROP INDEX "_posts_v_updated_at_idx";
  DROP INDEX "_posts_v_snapshot_idx";
  DROP INDEX "_posts_v_published_locale_idx";
  DROP INDEX "_posts_v_latest_idx";
  DROP INDEX "_posts_v_autosave_idx";
  DROP INDEX "_posts_v_version_meta_version_meta_image_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  DROP INDEX "_posts_v_locales_locale_parent_id_unique";
  DROP INDEX "_posts_v_rels_order_idx";
  DROP INDEX "_posts_v_rels_parent_idx";
  DROP INDEX "_posts_v_rels_path_idx";
  DROP INDEX "_posts_v_rels_posts_id_idx";
  DROP INDEX "_posts_v_rels_categories_id_idx";
  DROP INDEX "_posts_v_rels_users_id_idx";
  DROP INDEX "redirects_rels_posts_id_idx";
  DROP INDEX "search_rels_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX "header_rels_posts_id_idx";
  DROP INDEX "footer_rels_posts_id_idx";
  ALTER TABLE "exports" ALTER COLUMN "collection_slug" SET DEFAULT 'pages';
  ALTER TABLE "imports" ALTER COLUMN "collection_slug" SET DEFAULT 'pages';
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_populated_authors" ADD CONSTRAINT "insights_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_locales" ADD CONSTRAINT "insights_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_locales" ADD CONSTRAINT "insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_rels" ADD CONSTRAINT "insights_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_version_populated_authors" ADD CONSTRAINT "_insights_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_parent_id_insights_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_locales" ADD CONSTRAINT "_insights_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_locales" ADD CONSTRAINT "_insights_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_rels" ADD CONSTRAINT "_insights_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_insights_id_idx" ON "pages_rels" USING btree ("insights_id");
  CREATE INDEX "_pages_v_rels_insights_id_idx" ON "_pages_v_rels" USING btree ("insights_id");
  CREATE INDEX "insights_populated_authors_order_idx" ON "insights_populated_authors" USING btree ("_order");
  CREATE INDEX "insights_populated_authors_parent_id_idx" ON "insights_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "insights_hero_image_idx" ON "insights" USING btree ("hero_image_id");
  CREATE INDEX "insights_updated_at_idx" ON "insights" USING btree ("updated_at");
  CREATE INDEX "insights_created_at_idx" ON "insights" USING btree ("created_at");
  CREATE INDEX "insights__status_idx" ON "insights" USING btree ("_status");
  CREATE INDEX "insights_meta_meta_image_idx" ON "insights_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "insights_slug_idx" ON "insights_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "insights_locales_locale_parent_id_unique" ON "insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "insights_rels_order_idx" ON "insights_rels" USING btree ("order");
  CREATE INDEX "insights_rels_parent_idx" ON "insights_rels" USING btree ("parent_id");
  CREATE INDEX "insights_rels_path_idx" ON "insights_rels" USING btree ("path");
  CREATE INDEX "insights_rels_insights_id_idx" ON "insights_rels" USING btree ("insights_id");
  CREATE INDEX "insights_rels_categories_id_idx" ON "insights_rels" USING btree ("categories_id");
  CREATE INDEX "insights_rels_users_id_idx" ON "insights_rels" USING btree ("users_id");
  CREATE INDEX "_insights_v_version_populated_authors_order_idx" ON "_insights_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_insights_v_version_populated_authors_parent_id_idx" ON "_insights_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_insights_v_parent_idx" ON "_insights_v" USING btree ("parent_id");
  CREATE INDEX "_insights_v_version_version_hero_image_idx" ON "_insights_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_insights_v_version_version_updated_at_idx" ON "_insights_v" USING btree ("version_updated_at");
  CREATE INDEX "_insights_v_version_version_created_at_idx" ON "_insights_v" USING btree ("version_created_at");
  CREATE INDEX "_insights_v_version_version__status_idx" ON "_insights_v" USING btree ("version__status");
  CREATE INDEX "_insights_v_created_at_idx" ON "_insights_v" USING btree ("created_at");
  CREATE INDEX "_insights_v_updated_at_idx" ON "_insights_v" USING btree ("updated_at");
  CREATE INDEX "_insights_v_snapshot_idx" ON "_insights_v" USING btree ("snapshot");
  CREATE INDEX "_insights_v_published_locale_idx" ON "_insights_v" USING btree ("published_locale");
  CREATE INDEX "_insights_v_latest_idx" ON "_insights_v" USING btree ("latest");
  CREATE INDEX "_insights_v_autosave_idx" ON "_insights_v" USING btree ("autosave");
  CREATE INDEX "_insights_v_version_meta_version_meta_image_idx" ON "_insights_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "_insights_v_version_version_slug_idx" ON "_insights_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_insights_v_locales_locale_parent_id_unique" ON "_insights_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_insights_v_rels_order_idx" ON "_insights_v_rels" USING btree ("order");
  CREATE INDEX "_insights_v_rels_parent_idx" ON "_insights_v_rels" USING btree ("parent_id");
  CREATE INDEX "_insights_v_rels_path_idx" ON "_insights_v_rels" USING btree ("path");
  CREATE INDEX "_insights_v_rels_insights_id_idx" ON "_insights_v_rels" USING btree ("insights_id");
  CREATE INDEX "_insights_v_rels_categories_id_idx" ON "_insights_v_rels" USING btree ("categories_id");
  CREATE INDEX "_insights_v_rels_users_id_idx" ON "_insights_v_rels" USING btree ("users_id");
  CREATE INDEX "redirects_rels_insights_id_idx" ON "redirects_rels" USING btree ("insights_id");
  CREATE INDEX "search_rels_insights_id_idx" ON "search_rels" USING btree ("insights_id");
  CREATE INDEX "payload_locked_documents_rels_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("insights_id");
  CREATE INDEX "header_rels_insights_id_idx" ON "header_rels" USING btree ("insights_id");
  CREATE INDEX "footer_rels_insights_id_idx" ON "footer_rels" USING btree ("insights_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_insights_status" RENAME TO "enum_posts_status";
  ALTER TYPE "public"."enum__insights_v_version_status" RENAME TO "enum__posts_v_version_status";
  ALTER TYPE "public"."enum__insights_v_published_locale" RENAME TO "enum__posts_v_published_locale";
  ALTER TABLE "insights_populated_authors" RENAME TO "posts_populated_authors";
  ALTER TABLE "insights" RENAME TO "posts";
  ALTER TABLE "insights_locales" RENAME TO "posts_locales";
  ALTER TABLE "insights_rels" RENAME TO "posts_rels";
  ALTER TABLE "_insights_v_version_populated_authors" RENAME TO "_posts_v_version_populated_authors";
  ALTER TABLE "_insights_v" RENAME TO "_posts_v";
  ALTER TABLE "_insights_v_locales" RENAME TO "_posts_v_locales";
  ALTER TABLE "_insights_v_rels" RENAME TO "_posts_v_rels";
  ALTER TABLE "pages_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "_pages_v_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "posts_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "_posts_v_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "redirects_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "search_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "header_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "footer_rels" RENAME COLUMN "insights_id" TO "posts_id";
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_insights_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_insights_fk";
  
  ALTER TABLE "posts_populated_authors" DROP CONSTRAINT "insights_populated_authors_parent_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "insights_hero_image_id_media_id_fk";
  
  ALTER TABLE "posts_locales" DROP CONSTRAINT "insights_locales_meta_image_id_media_id_fk";
  
  ALTER TABLE "posts_locales" DROP CONSTRAINT "insights_locales_parent_id_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "insights_rels_parent_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "insights_rels_insights_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "insights_rels_categories_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "insights_rels_users_fk";
  
  ALTER TABLE "_posts_v_version_populated_authors" DROP CONSTRAINT "_insights_v_version_populated_authors_parent_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_insights_v_parent_id_insights_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_insights_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_locales" DROP CONSTRAINT "_insights_v_locales_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v_locales" DROP CONSTRAINT "_insights_v_locales_parent_id_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_insights_v_rels_parent_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_insights_v_rels_insights_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_insights_v_rels_categories_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_insights_v_rels_users_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_insights_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_insights_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_insights_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_insights_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_insights_fk";
  
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'posts'::text;
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'posts'::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum_pages_blocks_archive_relation_to" USING "relation_to"::"public"."enum_pages_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'posts'::text;
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts');
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DEFAULT 'posts'::"public"."enum__pages_v_blocks_archive_relation_to";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "relation_to" SET DATA TYPE "public"."enum__pages_v_blocks_archive_relation_to" USING "relation_to"::"public"."enum__pages_v_blocks_archive_relation_to";
  DROP INDEX "pages_rels_insights_id_idx";
  DROP INDEX "_pages_v_rels_insights_id_idx";
  DROP INDEX "insights_populated_authors_order_idx";
  DROP INDEX "insights_populated_authors_parent_id_idx";
  DROP INDEX "insights_hero_image_idx";
  DROP INDEX "insights_updated_at_idx";
  DROP INDEX "insights_created_at_idx";
  DROP INDEX "insights__status_idx";
  DROP INDEX "insights_meta_meta_image_idx";
  DROP INDEX "insights_slug_idx";
  DROP INDEX "insights_locales_locale_parent_id_unique";
  DROP INDEX "insights_rels_order_idx";
  DROP INDEX "insights_rels_parent_idx";
  DROP INDEX "insights_rels_path_idx";
  DROP INDEX "insights_rels_insights_id_idx";
  DROP INDEX "insights_rels_categories_id_idx";
  DROP INDEX "insights_rels_users_id_idx";
  DROP INDEX "_insights_v_version_populated_authors_order_idx";
  DROP INDEX "_insights_v_version_populated_authors_parent_id_idx";
  DROP INDEX "_insights_v_parent_idx";
  DROP INDEX "_insights_v_version_version_hero_image_idx";
  DROP INDEX "_insights_v_version_version_updated_at_idx";
  DROP INDEX "_insights_v_version_version_created_at_idx";
  DROP INDEX "_insights_v_version_version__status_idx";
  DROP INDEX "_insights_v_created_at_idx";
  DROP INDEX "_insights_v_updated_at_idx";
  DROP INDEX "_insights_v_snapshot_idx";
  DROP INDEX "_insights_v_published_locale_idx";
  DROP INDEX "_insights_v_latest_idx";
  DROP INDEX "_insights_v_autosave_idx";
  DROP INDEX "_insights_v_version_meta_version_meta_image_idx";
  DROP INDEX "_insights_v_version_version_slug_idx";
  DROP INDEX "_insights_v_locales_locale_parent_id_unique";
  DROP INDEX "_insights_v_rels_order_idx";
  DROP INDEX "_insights_v_rels_parent_idx";
  DROP INDEX "_insights_v_rels_path_idx";
  DROP INDEX "_insights_v_rels_insights_id_idx";
  DROP INDEX "_insights_v_rels_categories_id_idx";
  DROP INDEX "_insights_v_rels_users_id_idx";
  DROP INDEX "redirects_rels_insights_id_idx";
  DROP INDEX "search_rels_insights_id_idx";
  DROP INDEX "payload_locked_documents_rels_insights_id_idx";
  DROP INDEX "header_rels_insights_id_idx";
  DROP INDEX "footer_rels_insights_id_idx";
  ALTER TABLE "exports" ALTER COLUMN "collection_slug" DROP DEFAULT;
  ALTER TABLE "imports" ALTER COLUMN "collection_slug" DROP DEFAULT;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");`)
}
