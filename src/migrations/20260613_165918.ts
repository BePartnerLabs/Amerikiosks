import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "settings_robots_rules_allow" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar
  );
  
  CREATE TABLE "settings_robots_rules_disallow" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar
  );
  
  CREATE TABLE "settings_robots_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_agent" varchar DEFAULT '*'
  );
  
  ALTER TABLE "settings" ADD COLUMN "llms_enabled" boolean DEFAULT false;
  ALTER TABLE "settings" ADD COLUMN "llms_site_description" varchar;
  ALTER TABLE "settings" ADD COLUMN "llms_include_pages" boolean DEFAULT true;
  ALTER TABLE "settings" ADD COLUMN "llms_include_insights" boolean DEFAULT true;
  ALTER TABLE "settings_robots_rules_allow" ADD CONSTRAINT "settings_robots_rules_allow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_robots_rules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_robots_rules_disallow" ADD CONSTRAINT "settings_robots_rules_disallow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_robots_rules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_robots_rules" ADD CONSTRAINT "settings_robots_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "settings_robots_rules_allow_order_idx" ON "settings_robots_rules_allow" USING btree ("_order");
  CREATE INDEX "settings_robots_rules_allow_parent_id_idx" ON "settings_robots_rules_allow" USING btree ("_parent_id");
  CREATE INDEX "settings_robots_rules_disallow_order_idx" ON "settings_robots_rules_disallow" USING btree ("_order");
  CREATE INDEX "settings_robots_rules_disallow_parent_id_idx" ON "settings_robots_rules_disallow" USING btree ("_parent_id");
  CREATE INDEX "settings_robots_rules_order_idx" ON "settings_robots_rules" USING btree ("_order");
  CREATE INDEX "settings_robots_rules_parent_id_idx" ON "settings_robots_rules" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "settings_robots_rules_allow" CASCADE;
  DROP TABLE "settings_robots_rules_disallow" CASCADE;
  DROP TABLE "settings_robots_rules" CASCADE;
  ALTER TABLE "settings" DROP COLUMN "llms_enabled";
  ALTER TABLE "settings" DROP COLUMN "llms_site_description";
  ALTER TABLE "settings" DROP COLUMN "llms_include_pages";
  ALTER TABLE "settings" DROP COLUMN "llms_include_insights";`)
}
