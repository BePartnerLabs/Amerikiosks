import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Footer column headings and the contact CTA become translatable. Only
// `brandDescription` had been localized, so the headings ("Soluciones",
// "Compañía") rendered identically on /en and /es — whichever language they
// happened to be typed in.
//
// As generated this dropped `label`, `contact_cta` and `contact_cta_url`
// without copying them anywhere, which would have wiped the current footer
// copy. The existing values are carried over as the English translation
// first; Spanish falls back to them (localization.fallback) until someone
// translates them in /admin.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer_columns_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  ALTER TABLE "footer_locales" ADD COLUMN "contact_cta" varchar;
  ALTER TABLE "footer_locales" ADD COLUMN "contact_cta_url" varchar;`)

  await db.execute(sql`
   INSERT INTO "footer_columns_locales" ("label", "_locale", "_parent_id")
   SELECT "label", 'en', "id" FROM "footer_columns";`)

  // footer_locales may already hold an 'en' row from the brandDescription
  // migration, so upsert onto the (_locale, _parent_id) unique index rather
  // than blindly inserting.
  await db.execute(sql`
   INSERT INTO "footer_locales" ("contact_cta", "contact_cta_url", "_locale", "_parent_id")
   SELECT "contact_cta", "contact_cta_url", 'en', "id" FROM "footer"
   WHERE "contact_cta" IS NOT NULL OR "contact_cta_url" IS NOT NULL
   ON CONFLICT ("_locale", "_parent_id") DO UPDATE
   SET "contact_cta" = EXCLUDED."contact_cta",
       "contact_cta_url" = EXCLUDED."contact_cta_url";`)

  await db.execute(sql`
   ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "footer_columns" DROP COLUMN "label";
  ALTER TABLE "footer" DROP COLUMN "contact_cta";
  ALTER TABLE "footer" DROP COLUMN "contact_cta_url";`)
}

// Rolling back restores the English copy onto the single shared column; any
// other locale's translations for these fields can't be represented there
// and are dropped.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_columns" ADD COLUMN "label" varchar;
  ALTER TABLE "footer" ADD COLUMN "contact_cta" varchar;
  ALTER TABLE "footer" ADD COLUMN "contact_cta_url" varchar;`)

  await db.execute(sql`
   UPDATE "footer_columns" c
   SET "label" = l."label"
   FROM "footer_columns_locales" l
   WHERE l."_parent_id" = c."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
   UPDATE "footer" f
   SET "contact_cta" = l."contact_cta", "contact_cta_url" = l."contact_cta_url"
   FROM "footer_locales" l
   WHERE l."_parent_id" = f."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
   UPDATE "footer_columns" SET "label" = '' WHERE "label" IS NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "label" SET NOT NULL;
  DROP TABLE "footer_columns_locales" CASCADE;
  ALTER TABLE "footer_locales" DROP COLUMN "contact_cta";
  ALTER TABLE "footer_locales" DROP COLUMN "contact_cta_url";`)
}
