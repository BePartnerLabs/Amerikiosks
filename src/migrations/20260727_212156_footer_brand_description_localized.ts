import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer_locales" (
  	"brand_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");`)

  // Preserve the existing (pre-localization) value as the "en" translation
  // before dropping the old column — otherwise this migration silently
  // wipes whatever brand description is currently live. Spanish stays
  // empty and falls back to English (localization.fallback: true) until an
  // editor translates it.
  await db.execute(sql`
   INSERT INTO "footer_locales" ("brand_description", "_locale", "_parent_id")
   SELECT "brand_description", 'en', "id" FROM "footer" WHERE "brand_description" IS NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "footer" DROP COLUMN "brand_description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "brand_description" varchar;`)

  // Restore the "en" translation back onto the single non-localized column
  // before dropping the locales table, so rolling back doesn't lose data
  // either.
  await db.execute(sql`
   UPDATE "footer" SET "brand_description" = "footer_locales"."brand_description"
   FROM "footer_locales"
   WHERE "footer_locales"."_parent_id" = "footer"."id" AND "footer_locales"."_locale" = 'en';`)

  await db.execute(sql`
   DROP TABLE "footer_locales" CASCADE;`)
}
