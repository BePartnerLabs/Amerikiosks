import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Makes the Form block's panel fields localized.
 *
 * The generated version of this migration created the `_locales` tables and
 * then dropped the original columns — which silently discards whatever those
 * fields already hold. Verified: running it as generated emptied /contact's
 * panel eyebrow, headline and intro content.
 *
 * The INSERT ... SELECT below copies each existing value into the default
 * locale before the columns go away, so an already-published page keeps its
 * English copy and only needs the Spanish one written. Same shape as the
 * brands version backfill documented in src/collections/CLAUDE.md.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_form_block_locales" (
  	"intro_content" jsonb,
  	"panel_label" varchar,
  	"panel_headline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "_pages_v_blocks_form_block_locales" (
  	"intro_content" jsonb,
  	"panel_label" varchar,
  	"panel_headline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "pages_blocks_form_block_locales" ADD CONSTRAINT "pages_blocks_form_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_form_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block_locales" ADD CONSTRAINT "_pages_v_blocks_form_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_form_block"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_form_block_locales_locale_parent_id_unique" ON "pages_blocks_form_block_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_form_block_locales_locale_parent_id_unique" ON "_pages_v_blocks_form_block_locales" USING btree ("_locale","_parent_id");

  -- Carry the existing values over into the default locale before dropping the
  -- columns they live in. Rows with nothing in any of the three are skipped:
  -- an empty locale row would be noise, not content.
  INSERT INTO "pages_blocks_form_block_locales"
    ("intro_content", "panel_label", "panel_headline", "_locale", "_parent_id")
  SELECT b."intro_content", b."panel_label", b."panel_headline", 'en', b."id"
  FROM "pages_blocks_form_block" b
  WHERE b."intro_content" IS NOT NULL
     OR b."panel_label" IS NOT NULL
     OR b."panel_headline" IS NOT NULL;

  INSERT INTO "_pages_v_blocks_form_block_locales"
    ("intro_content", "panel_label", "panel_headline", "_locale", "_parent_id")
  SELECT b."intro_content", b."panel_label", b."panel_headline", 'en', b."id"
  FROM "_pages_v_blocks_form_block" b
  WHERE b."intro_content" IS NOT NULL
     OR b."panel_label" IS NOT NULL
     OR b."panel_headline" IS NOT NULL;

  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "intro_content";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "panel_label";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "panel_headline";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "intro_content";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "panel_label";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "panel_headline";`)
}

/** Reverses the move, keeping the default locale's copy. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_block" ADD COLUMN "intro_content" jsonb;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "panel_label" varchar;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "panel_headline" varchar;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "intro_content" jsonb;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "panel_label" varchar;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "panel_headline" varchar;

  UPDATE "pages_blocks_form_block" b
  SET "intro_content" = l."intro_content",
      "panel_label" = l."panel_label",
      "panel_headline" = l."panel_headline"
  FROM "pages_blocks_form_block_locales" l
  WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';

  UPDATE "_pages_v_blocks_form_block" b
  SET "intro_content" = l."intro_content",
      "panel_label" = l."panel_label",
      "panel_headline" = l."panel_headline"
  FROM "_pages_v_blocks_form_block_locales" l
  WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';

  DROP TABLE "pages_blocks_form_block_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block_locales" CASCADE;`)
}
