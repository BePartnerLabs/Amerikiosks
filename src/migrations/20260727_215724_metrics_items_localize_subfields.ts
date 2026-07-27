import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Metrics `items` moved from a localized *array* to localized leaf fields
// (see src/blocks/Metrics/config.ts for why). Schema-wise that means the
// per-locale columns move out of the item table into a child _locales
// table, and the item table keeps one shared row per metric.
//
// The generated migration dropped `value`/`label` outright, which would
// have thrown the content away, and it did not account for the item tables
// already holding one row *per locale* — after `_locale` goes away those
// become duplicate rows for the same metric. Both are handled below:
// values are copied into the new tables first, then each metric collapses
// onto a single canonical row (English preferred) before the old columns
// are dropped.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_metrics_items_locales" (
  	"value" varchar,
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "_pages_v_blocks_metrics_items_locales" (
  	"value" varchar,
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );`)

  // Copy each row's localized values across, attributing them to the row
  // that will survive the de-duplication below.
  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "pages_blocks_metrics_items"
     GROUP BY "_parent_id", "_order"
   )
   INSERT INTO "pages_blocks_metrics_items_locales" ("value", "label", "_locale", "_parent_id")
   SELECT i."value", i."label", i."_locale", c.canonical_id
   FROM "pages_blocks_metrics_items" i
   JOIN canon c ON c."_parent_id" = i."_parent_id" AND c."_order" = i."_order";`)

  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "_pages_v_blocks_metrics_items"
     GROUP BY "_parent_id", "_order"
   )
   INSERT INTO "_pages_v_blocks_metrics_items_locales" ("value", "label", "_locale", "_parent_id")
   SELECT i."value", i."label", i."_locale", c.canonical_id
   FROM "_pages_v_blocks_metrics_items" i
   JOIN canon c ON c."_parent_id" = i."_parent_id" AND c."_order" = i."_order";`)

  // Collapse the per-locale rows down to the canonical one.
  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "pages_blocks_metrics_items"
     GROUP BY "_parent_id", "_order"
   )
   DELETE FROM "pages_blocks_metrics_items" i
   USING canon c
   WHERE c."_parent_id" = i."_parent_id" AND c."_order" = i."_order"
     AND i."id" <> c.canonical_id;`)

  await db.execute(sql`
   WITH canon AS (
     SELECT "_parent_id", "_order",
            (ARRAY_AGG("id" ORDER BY ("_locale" <> 'en'), "id"))[1] AS canonical_id
     FROM "_pages_v_blocks_metrics_items"
     GROUP BY "_parent_id", "_order"
   )
   DELETE FROM "_pages_v_blocks_metrics_items" i
   USING canon c
   WHERE c."_parent_id" = i."_parent_id" AND c."_order" = i."_order"
     AND i."id" <> c.canonical_id;`)

  await db.execute(sql`
   DROP INDEX "pages_blocks_metrics_items_locale_idx";
  DROP INDEX "_pages_v_blocks_metrics_items_locale_idx";
  ALTER TABLE "pages_blocks_metrics_items_locales" ADD CONSTRAINT "pages_blocks_metrics_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_metrics_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_metrics_items_locales" ADD CONSTRAINT "_pages_v_blocks_metrics_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_metrics_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_metrics_items_locales_locale_parent_id_unique" ON "pages_blocks_metrics_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_metrics_items_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_metrics_items_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages_blocks_metrics_items" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_metrics_items" DROP COLUMN "value";
  ALTER TABLE "pages_blocks_metrics_items" DROP COLUMN "label";
  ALTER TABLE "_pages_v_blocks_metrics_items" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_metrics_items" DROP COLUMN "value";
  ALTER TABLE "_pages_v_blocks_metrics_items" DROP COLUMN "label";`)
}

// Rolling back restores the English copy onto the single-row-per-locale
// shape. Any other locale's translations for these two fields can't be
// represented once `_locale` is back on the row itself, so they are
// dropped — acceptable here because the collapsed rows are regenerated on
// the next save, but worth knowing before rolling back deliberately.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_metrics_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_metrics_items" ADD COLUMN "value" varchar;
  ALTER TABLE "pages_blocks_metrics_items" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_blocks_metrics_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_metrics_items" ADD COLUMN "value" varchar;
  ALTER TABLE "_pages_v_blocks_metrics_items" ADD COLUMN "label" varchar;`)

  await db.execute(sql`
   UPDATE "pages_blocks_metrics_items" i
   SET "value" = l."value", "label" = l."label", "_locale" = l."_locale"
   FROM "pages_blocks_metrics_items_locales" l
   WHERE l."_parent_id" = i."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
   UPDATE "_pages_v_blocks_metrics_items" i
   SET "value" = l."value", "label" = l."label", "_locale" = l."_locale"
   FROM "_pages_v_blocks_metrics_items_locales" l
   WHERE l."_parent_id" = i."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
   UPDATE "pages_blocks_metrics_items" SET "_locale" = 'en' WHERE "_locale" IS NULL;
  UPDATE "_pages_v_blocks_metrics_items" SET "_locale" = 'en' WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_metrics_items" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "_pages_v_blocks_metrics_items" ALTER COLUMN "_locale" SET NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "pages_blocks_metrics_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_metrics_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_metrics_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_metrics_items_locales" CASCADE;
  CREATE INDEX "pages_blocks_metrics_items_locale_idx" ON "pages_blocks_metrics_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_metrics_items_locale_idx" ON "_pages_v_blocks_metrics_items" USING btree ("_locale");`)
}
