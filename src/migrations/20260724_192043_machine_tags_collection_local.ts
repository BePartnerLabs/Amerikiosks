import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// LOCAL DEV ONLY — schema-only migration, does not preserve existing
// machines_tags / formats_grid filterTags data. Before this ships to
// production, replace with a data-preserving migration (Local API script,
// not raw SQL into the _rels tables) and test it against a prod DB dump.
// See project memory: tags migration prod safety.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "tags" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "tags_label_idx" ON "tags" USING btree ("label");
    CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
    CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");

    DROP TABLE "machines_tags" CASCADE;
    DROP TABLE "_machines_v_version_tags" CASCADE;
    DROP TABLE "pages_blocks_formats_grid_filter_tags" CASCADE;
    DROP TABLE "_pages_v_blocks_formats_grid_filter_tags" CASCADE;

    CREATE TABLE "machines_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "tags_id" integer
    );
    ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "machines_rels_order_idx" ON "machines_rels" USING btree ("order");
    CREATE INDEX "machines_rels_parent_idx" ON "machines_rels" USING btree ("parent_id");
    CREATE INDEX "machines_rels_path_idx" ON "machines_rels" USING btree ("path");
    CREATE INDEX "machines_rels_tags_id_idx" ON "machines_rels" USING btree ("tags_id");

    CREATE TABLE "_machines_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "tags_id" integer
    );
    ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "_machines_v_rels_order_idx" ON "_machines_v_rels" USING btree ("order");
    CREATE INDEX "_machines_v_rels_parent_idx" ON "_machines_v_rels" USING btree ("parent_id");
    CREATE INDEX "_machines_v_rels_path_idx" ON "_machines_v_rels" USING btree ("path");
    CREATE INDEX "_machines_v_rels_tags_id_idx" ON "_machines_v_rels" USING btree ("tags_id");

    ALTER TABLE "pages_rels" ADD COLUMN "tags_id" integer;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "pages_rels_tags_id_idx" ON "pages_rels" USING btree ("tags_id");

    ALTER TABLE "_pages_v_rels" ADD COLUMN "tags_id" integer;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "_pages_v_rels_tags_id_idx" ON "_pages_v_rels" USING btree ("tags_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_tags_fk";
    ALTER TABLE "pages_rels" DROP COLUMN "tags_id";
    ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_tags_fk";
    ALTER TABLE "_pages_v_rels" DROP COLUMN "tags_id";
    DROP TABLE "machines_rels" CASCADE;
    DROP TABLE "_machines_v_rels" CASCADE;
    DROP TABLE "tags" CASCADE;
  `)
}
