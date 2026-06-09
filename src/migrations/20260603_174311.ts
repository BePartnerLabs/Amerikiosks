import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Builds on top of 20260603_173934 which already:
 *   - renamed value_props tables → card_grid tables
 *   - added variant/link_type as plain varchar columns
 *   - added most new columns
 *
 * This migration:
 *   - creates proper ENUM types for variant and link_type
 *   - converts those varchar columns to ENUM
 *   - adds subheading + link_label to locales tables (missed in prior migration)
 *   - drops old-named constraints/indexes and recreates with new names
 *   - adds foreign key constraints and indexes for new link_reference_id columns
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create ENUM types
  await db.execute(sql`
    CREATE TYPE "public"."enum_pages_blocks_card_grid_variant" AS ENUM('compact', 'icon', 'pillar');
    CREATE TYPE "public"."enum_pages_blocks_card_grid_link_type" AS ENUM('custom', 'reference');
    CREATE TYPE "public"."enum_pages_blocks_card_grid_items_link_type" AS ENUM('custom', 'reference');
    CREATE TYPE "public"."enum__pages_v_blocks_card_grid_variant" AS ENUM('compact', 'icon', 'pillar');
    CREATE TYPE "public"."enum__pages_v_blocks_card_grid_link_type" AS ENUM('custom', 'reference');
    CREATE TYPE "public"."enum__pages_v_blocks_card_grid_items_link_type" AS ENUM('custom', 'reference');
  `)

  // Drop defaults before casting varchar → ENUM (Postgres can't cast defaults automatically)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid"
      ALTER COLUMN "variant" DROP DEFAULT,
      ALTER COLUMN "link_type" DROP DEFAULT;
    ALTER TABLE "pages_blocks_card_grid_items"
      ALTER COLUMN "link_type" DROP DEFAULT;
    ALTER TABLE "_pages_v_blocks_card_grid"
      ALTER COLUMN "variant" DROP DEFAULT,
      ALTER COLUMN "link_type" DROP DEFAULT;
    ALTER TABLE "_pages_v_blocks_card_grid_items"
      ALTER COLUMN "link_type" DROP DEFAULT;
  `)

  // Convert varchar → ENUM for variant and link_type columns
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid"
      ALTER COLUMN "variant" TYPE "enum_pages_blocks_card_grid_variant"
        USING "variant"::"enum_pages_blocks_card_grid_variant",
      ALTER COLUMN "link_type" TYPE "enum_pages_blocks_card_grid_link_type"
        USING "link_type"::"enum_pages_blocks_card_grid_link_type";

    ALTER TABLE "pages_blocks_card_grid_items"
      ALTER COLUMN "link_type" TYPE "enum_pages_blocks_card_grid_items_link_type"
        USING "link_type"::"enum_pages_blocks_card_grid_items_link_type";

    ALTER TABLE "_pages_v_blocks_card_grid"
      ALTER COLUMN "variant" TYPE "enum__pages_v_blocks_card_grid_variant"
        USING "variant"::"enum__pages_v_blocks_card_grid_variant",
      ALTER COLUMN "link_type" TYPE "enum__pages_v_blocks_card_grid_link_type"
        USING "link_type"::"enum__pages_v_blocks_card_grid_link_type";

    ALTER TABLE "_pages_v_blocks_card_grid_items"
      ALTER COLUMN "link_type" TYPE "enum__pages_v_blocks_card_grid_items_link_type"
        USING "link_type"::"enum__pages_v_blocks_card_grid_items_link_type";
  `)

  // Add missing locales columns (subheading and link_label were not in prior migration)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid_locales"
      ADD COLUMN IF NOT EXISTS "subheading" varchar,
      ADD COLUMN IF NOT EXISTS "link_label" varchar;

    ALTER TABLE "_pages_v_blocks_card_grid_locales"
      ADD COLUMN IF NOT EXISTS "subheading" varchar,
      ADD COLUMN IF NOT EXISTS "link_label" varchar;
  `)

  // Drop old-named constraints (from before table rename)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid_items" DROP CONSTRAINT IF EXISTS "pages_blocks_value_props_items_parent_id_fk";
    ALTER TABLE "pages_blocks_card_grid" DROP CONSTRAINT IF EXISTS "pages_blocks_value_props_parent_id_fk";
    ALTER TABLE "pages_blocks_card_grid_locales" DROP CONSTRAINT IF EXISTS "pages_blocks_value_props_locales_parent_id_fk";
    ALTER TABLE "_pages_v_blocks_card_grid_items" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_value_props_items_parent_id_fk";
    ALTER TABLE "_pages_v_blocks_card_grid" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_value_props_parent_id_fk";
    ALTER TABLE "_pages_v_blocks_card_grid_locales" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_value_props_locales_parent_id_fk";
  `)

  // Drop old-named indexes
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_blocks_value_props_items_order_idx";
    DROP INDEX IF EXISTS "pages_blocks_value_props_items_parent_id_idx";
    DROP INDEX IF EXISTS "pages_blocks_value_props_items_locale_idx";
    DROP INDEX IF EXISTS "pages_blocks_value_props_order_idx";
    DROP INDEX IF EXISTS "pages_blocks_value_props_parent_id_idx";
    DROP INDEX IF EXISTS "pages_blocks_value_props_path_idx";
    DROP INDEX IF EXISTS "pages_blocks_value_props_locales_locale_parent_id_unique";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_items_order_idx";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_items_parent_id_idx";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_items_locale_idx";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_order_idx";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_parent_id_idx";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_path_idx";
    DROP INDEX IF EXISTS "_pages_v_blocks_value_props_locales_locale_parent_id_unique";
  `)

  // Add new foreign key constraints
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid_items"
      ADD CONSTRAINT "pages_blocks_card_grid_items_link_reference_id_pages_id_fk"
        FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "pages_blocks_card_grid_items_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_card_grid"
      ADD CONSTRAINT "pages_blocks_card_grid_link_reference_id_pages_id_fk"
        FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "pages_blocks_card_grid_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "pages_blocks_card_grid_locales"
      ADD CONSTRAINT "pages_blocks_card_grid_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_pages_v_blocks_card_grid_items"
      ADD CONSTRAINT "_pages_v_blocks_card_grid_items_link_reference_id_pages_id_fk"
        FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "_pages_v_blocks_card_grid_items_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_pages_v_blocks_card_grid"
      ADD CONSTRAINT "_pages_v_blocks_card_grid_link_reference_id_pages_id_fk"
        FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "_pages_v_blocks_card_grid_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_pages_v_blocks_card_grid_locales"
      ADD CONSTRAINT "_pages_v_blocks_card_grid_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // Create new indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_items_order_idx" ON "pages_blocks_card_grid_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_items_parent_id_idx" ON "pages_blocks_card_grid_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_items_locale_idx" ON "pages_blocks_card_grid_items" USING btree ("_locale");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_items_link_link_reference_idx" ON "pages_blocks_card_grid_items" USING btree ("link_reference_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_order_idx" ON "pages_blocks_card_grid" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_parent_id_idx" ON "pages_blocks_card_grid" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_path_idx" ON "pages_blocks_card_grid" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_link_link_reference_idx" ON "pages_blocks_card_grid" USING btree ("link_reference_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_card_grid_locales_locale_parent_id_unique" ON "pages_blocks_card_grid_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_items_order_idx" ON "_pages_v_blocks_card_grid_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_items_parent_id_idx" ON "_pages_v_blocks_card_grid_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_items_locale_idx" ON "_pages_v_blocks_card_grid_items" USING btree ("_locale");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_items_link_link_reference_idx" ON "_pages_v_blocks_card_grid_items" USING btree ("link_reference_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_order_idx" ON "_pages_v_blocks_card_grid" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_parent_id_idx" ON "_pages_v_blocks_card_grid" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_path_idx" ON "_pages_v_blocks_card_grid" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_link_link_reference_idx" ON "_pages_v_blocks_card_grid" USING btree ("link_reference_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_locales_locale_parent_id_unique" ON "_pages_v_blocks_card_grid_locales" USING btree ("_locale","_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid_locales" DROP COLUMN IF EXISTS "subheading";
    ALTER TABLE "pages_blocks_card_grid_locales" DROP COLUMN IF EXISTS "link_label";
    ALTER TABLE "_pages_v_blocks_card_grid_locales" DROP COLUMN IF EXISTS "subheading";
    ALTER TABLE "_pages_v_blocks_card_grid_locales" DROP COLUMN IF EXISTS "link_label";

    ALTER TABLE "pages_blocks_card_grid"
      ALTER COLUMN "variant" TYPE varchar USING "variant"::varchar,
      ALTER COLUMN "link_type" TYPE varchar USING "link_type"::varchar;
    ALTER TABLE "pages_blocks_card_grid_items"
      ALTER COLUMN "link_type" TYPE varchar USING "link_type"::varchar;
    ALTER TABLE "_pages_v_blocks_card_grid"
      ALTER COLUMN "variant" TYPE varchar USING "variant"::varchar,
      ALTER COLUMN "link_type" TYPE varchar USING "link_type"::varchar;
    ALTER TABLE "_pages_v_blocks_card_grid_items"
      ALTER COLUMN "link_type" TYPE varchar USING "link_type"::varchar;

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_card_grid_variant";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_card_grid_link_type";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_card_grid_items_link_type";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_card_grid_variant";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_card_grid_link_type";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_card_grid_items_link_type";
  `)
}
