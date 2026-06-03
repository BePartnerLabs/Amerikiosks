import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Rename live tables
  await db.execute(
    sql`ALTER TABLE IF EXISTS "pages_blocks_value_props" RENAME TO "pages_blocks_card_grid";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "pages_blocks_value_props_items" RENAME TO "pages_blocks_card_grid_items";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "pages_blocks_value_props_locales" RENAME TO "pages_blocks_card_grid_locales";`,
  )

  // Rename version tables
  await db.execute(
    sql`ALTER TABLE IF EXISTS "_pages_v_blocks_value_props" RENAME TO "_pages_v_blocks_card_grid";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "_pages_v_blocks_value_props_items" RENAME TO "_pages_v_blocks_card_grid_items";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "_pages_v_blocks_value_props_locales" RENAME TO "_pages_v_blocks_card_grid_locales";`,
  )

  // Add new columns to live block table
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid"
      ADD COLUMN IF NOT EXISTS "variant" varchar NOT NULL DEFAULT 'compact',
      ADD COLUMN IF NOT EXISTS "subheading" varchar,
      ADD COLUMN IF NOT EXISTS "link_label" varchar,
      ADD COLUMN IF NOT EXISTS "link_url" varchar,
      ADD COLUMN IF NOT EXISTS "link_type" varchar DEFAULT 'custom',
      ADD COLUMN IF NOT EXISTS "link_reference_id" integer REFERENCES "public"."pages"("id") ON DELETE SET NULL ON UPDATE no action;
  `)

  // Add eyebrow to live locales table (localized field)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid_locales"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
  `)

  // Add new columns to live items table
  await db.execute(sql`
    ALTER TABLE "pages_blocks_card_grid_items"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "icon" varchar,
      ADD COLUMN IF NOT EXISTS "link_label" varchar,
      ADD COLUMN IF NOT EXISTS "link_url" varchar,
      ADD COLUMN IF NOT EXISTS "link_type" varchar DEFAULT 'custom',
      ADD COLUMN IF NOT EXISTS "link_reference_id" integer REFERENCES "public"."pages"("id") ON DELETE SET NULL ON UPDATE no action;
  `)

  // Add new columns to version block table
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_card_grid"
      ADD COLUMN IF NOT EXISTS "variant" varchar NOT NULL DEFAULT 'compact',
      ADD COLUMN IF NOT EXISTS "subheading" varchar,
      ADD COLUMN IF NOT EXISTS "link_label" varchar,
      ADD COLUMN IF NOT EXISTS "link_url" varchar,
      ADD COLUMN IF NOT EXISTS "link_type" varchar DEFAULT 'custom',
      ADD COLUMN IF NOT EXISTS "link_reference_id" integer REFERENCES "public"."pages"("id") ON DELETE SET NULL ON UPDATE no action;
  `)

  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_card_grid_locales"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_card_grid_items"
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar,
      ADD COLUMN IF NOT EXISTS "icon" varchar,
      ADD COLUMN IF NOT EXISTS "link_label" varchar,
      ADD COLUMN IF NOT EXISTS "link_url" varchar,
      ADD COLUMN IF NOT EXISTS "link_type" varchar DEFAULT 'custom',
      ADD COLUMN IF NOT EXISTS "link_reference_id" integer REFERENCES "public"."pages"("id") ON DELETE SET NULL ON UPDATE no action;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse renames
  await db.execute(
    sql`ALTER TABLE IF EXISTS "pages_blocks_card_grid" RENAME TO "pages_blocks_value_props";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "pages_blocks_card_grid_items" RENAME TO "pages_blocks_value_props_items";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "pages_blocks_card_grid_locales" RENAME TO "pages_blocks_value_props_locales";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "_pages_v_blocks_card_grid" RENAME TO "_pages_v_blocks_value_props";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "_pages_v_blocks_card_grid_items" RENAME TO "_pages_v_blocks_value_props_items";`,
  )
  await db.execute(
    sql`ALTER TABLE IF EXISTS "_pages_v_blocks_card_grid_locales" RENAME TO "_pages_v_blocks_value_props_locales";`,
  )
}
