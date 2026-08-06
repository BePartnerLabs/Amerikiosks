import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_machine_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"family_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_machine_models_locales" (
  	"eyebrow" varchar DEFAULT 'The range',
  	"heading" varchar DEFAULT 'Every model we build',
  	"cta_label" varchar DEFAULT 'See machine',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_machine_models" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"family_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_machine_models_locales" (
  	"eyebrow" varchar DEFAULT 'The range',
  	"heading" varchar DEFAULT 'Every model we build',
  	"cta_label" varchar DEFAULT 'See machine',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_machine_models" ADD CONSTRAINT "pages_blocks_machine_models_family_id_machine_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."machine_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_machine_models" ADD CONSTRAINT "pages_blocks_machine_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_machine_models_locales" ADD CONSTRAINT "pages_blocks_machine_models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_machine_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_machine_models" ADD CONSTRAINT "_pages_v_blocks_machine_models_family_id_machine_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."machine_families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_machine_models" ADD CONSTRAINT "_pages_v_blocks_machine_models_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_machine_models_locales" ADD CONSTRAINT "_pages_v_blocks_machine_models_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_machine_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_machine_models_order_idx" ON "pages_blocks_machine_models" USING btree ("_order");
  CREATE INDEX "pages_blocks_machine_models_parent_id_idx" ON "pages_blocks_machine_models" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_machine_models_path_idx" ON "pages_blocks_machine_models" USING btree ("_path");
  CREATE INDEX "pages_blocks_machine_models_family_idx" ON "pages_blocks_machine_models" USING btree ("family_id");
  CREATE UNIQUE INDEX "pages_blocks_machine_models_locales_locale_parent_id_unique" ON "pages_blocks_machine_models_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_machine_models_order_idx" ON "_pages_v_blocks_machine_models" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_machine_models_parent_id_idx" ON "_pages_v_blocks_machine_models" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_machine_models_path_idx" ON "_pages_v_blocks_machine_models" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_machine_models_family_idx" ON "_pages_v_blocks_machine_models" USING btree ("family_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_machine_models_locales_locale_parent_id_uniq" ON "_pages_v_blocks_machine_models_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_machine_models" CASCADE;
  DROP TABLE "pages_blocks_machine_models_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_machine_models" CASCADE;
  DROP TABLE "_pages_v_blocks_machine_models_locales" CASCADE;`)
}
