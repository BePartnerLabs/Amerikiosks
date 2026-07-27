import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// CardGrid `items` moved from a localized *array* to localized leaf fields,
// same reasoning and shape as the Metrics change in
// 20260727_215724_metrics_items_localize_subfields — see
// src/blocks/CardGrid/config.ts. Media, icon and the link target become
// shared across locales; only the copy stays translated.
//
// Two corrections to what was generated:
//   * it also tried to create `footer_locales` and drop
//     `footer.brand_description`, because the snapshot it diffed against
//     (metrics) predates the footer migration — those two landed out of
//     chronological order. That work already happened in
//     20260727_212156_footer_brand_description_localized, so it is dropped
//     here; the accompanying snapshot is correct and already includes it.
//   * it dropped the localized columns outright and ignored that the item
//     tables hold one row *per locale*, which become duplicates once
//     `_locale` is gone. Values are copied across first, then each card
//     collapses onto a single canonical row (English preferred).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_card_grid_items_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" jsonb,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "_pages_v_blocks_card_grid_items_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" jsonb,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );`)

  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "pages_blocks_card_grid_items"
     GROUP BY "_parent_id", "_order"
   )
   INSERT INTO "pages_blocks_card_grid_items_locales" ("eyebrow", "title", "body", "link_label", "_locale", "_parent_id")
   SELECT i."eyebrow", i."title", i."body", i."link_label", i."_locale", c.canonical_id
   FROM "pages_blocks_card_grid_items" i
   JOIN canon c ON c."_parent_id" = i."_parent_id" AND c."_order" = i."_order";`)

  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "_pages_v_blocks_card_grid_items"
     GROUP BY "_parent_id", "_order"
   )
   INSERT INTO "_pages_v_blocks_card_grid_items_locales" ("eyebrow", "title", "body", "link_label", "_locale", "_parent_id")
   SELECT i."eyebrow", i."title", i."body", i."link_label", i."_locale", c.canonical_id
   FROM "_pages_v_blocks_card_grid_items" i
   JOIN canon c ON c."_parent_id" = i."_parent_id" AND c."_order" = i."_order";`)

  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "pages_blocks_card_grid_items"
     GROUP BY "_parent_id", "_order"
   )
   DELETE FROM "pages_blocks_card_grid_items" i
   USING canon c
   WHERE c."_parent_id" = i."_parent_id" AND c."_order" = i."_order"
     AND i."id" <> c.canonical_id;`)

  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "_pages_v_blocks_card_grid_items"
     GROUP BY "_parent_id", "_order"
   )
   DELETE FROM "_pages_v_blocks_card_grid_items" i
   USING canon c
   WHERE c."_parent_id" = i."_parent_id" AND c."_order" = i."_order"
     AND i."id" <> c.canonical_id;`)

  await db.execute(sql`
   DROP INDEX "pages_blocks_card_grid_items_locale_idx";
  DROP INDEX "_pages_v_blocks_card_grid_items_locale_idx";
  ALTER TABLE "pages_blocks_card_grid_items_locales" ADD CONSTRAINT "pages_blocks_card_grid_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_card_grid_items_locales" ADD CONSTRAINT "_pages_v_blocks_card_grid_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_card_grid_items_locales_locale_parent_id_unique" ON "pages_blocks_card_grid_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_card_grid_items_locales_locale_parent_id_uni" ON "_pages_v_blocks_card_grid_items_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "link_label";`)
}

// Rolling back restores the English copy onto the single-row-per-locale
// shape; other locales' translations for these fields can't be represented
// once `_locale` is back on the row itself, so they are dropped.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "body" jsonb;
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "body" jsonb;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "link_label" varchar;`)

  await db.execute(sql`
   UPDATE "pages_blocks_card_grid_items" i
   SET "eyebrow" = l."eyebrow", "title" = l."title", "body" = l."body",
       "link_label" = l."link_label", "_locale" = l."_locale"
   FROM "pages_blocks_card_grid_items_locales" l
   WHERE l."_parent_id" = i."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
   UPDATE "_pages_v_blocks_card_grid_items" i
   SET "eyebrow" = l."eyebrow", "title" = l."title", "body" = l."body",
       "link_label" = l."link_label", "_locale" = l."_locale"
   FROM "_pages_v_blocks_card_grid_items_locales" l
   WHERE l."_parent_id" = i."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
   UPDATE "pages_blocks_card_grid_items" SET "_locale" = 'en' WHERE "_locale" IS NULL;
  UPDATE "_pages_v_blocks_card_grid_items" SET "_locale" = 'en' WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "_locale" SET NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "pages_blocks_card_grid_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_card_grid_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_card_grid_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_card_grid_items_locales" CASCADE;
  CREATE INDEX "pages_blocks_card_grid_items_locale_idx" ON "pages_blocks_card_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_card_grid_items_locale_idx" ON "_pages_v_blocks_card_grid_items" USING btree ("_locale");`)
}
