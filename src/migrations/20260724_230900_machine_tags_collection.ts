import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Converts Machines.tags and FormatsGrid.filterTags from free-text arrays
// to a relationship against a new `machine-tags` collection (table
// machine_tags). Schema-only — does not preserve existing free-text tag
// data. Tested against a production DB dump (2026-07-24): 17 rows across
// 16 machines, all re-creatable by hand from
// docs/superpowers/specs/2026-07-24-machine-tags-pre-migration-mapping.md
// (one extra "home" tag on machine 1 not in that doc — add it too).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "machine_tags" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "machine_tags_label_idx" ON "machine_tags" USING btree ("label");
    CREATE INDEX "machine_tags_updated_at_idx" ON "machine_tags" USING btree ("updated_at");
    CREATE INDEX "machine_tags_created_at_idx" ON "machine_tags" USING btree ("created_at");

    DROP TABLE IF EXISTS "machines_tags" CASCADE;
    DROP TABLE IF EXISTS "_machines_v_version_tags" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_formats_grid_filter_tags" CASCADE;
    DROP TABLE IF EXISTS "_pages_v_blocks_formats_grid_filter_tags" CASCADE;

    CREATE TABLE "machines_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "machine_tags_id" integer
    );
    ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."machines"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "machines_rels" ADD CONSTRAINT "machines_rels_machine_tags_fk" FOREIGN KEY ("machine_tags_id") REFERENCES "public"."machine_tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "machines_rels_order_idx" ON "machines_rels" USING btree ("order");
    CREATE INDEX "machines_rels_parent_idx" ON "machines_rels" USING btree ("parent_id");
    CREATE INDEX "machines_rels_path_idx" ON "machines_rels" USING btree ("path");
    CREATE INDEX "machines_rels_machine_tags_id_idx" ON "machines_rels" USING btree ("machine_tags_id");

    CREATE TABLE "_machines_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "machine_tags_id" integer
    );
    ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_machines_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_machines_v_rels" ADD CONSTRAINT "_machines_v_rels_machine_tags_fk" FOREIGN KEY ("machine_tags_id") REFERENCES "public"."machine_tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "_machines_v_rels_order_idx" ON "_machines_v_rels" USING btree ("order");
    CREATE INDEX "_machines_v_rels_parent_idx" ON "_machines_v_rels" USING btree ("parent_id");
    CREATE INDEX "_machines_v_rels_path_idx" ON "_machines_v_rels" USING btree ("path");
    CREATE INDEX "_machines_v_rels_machine_tags_id_idx" ON "_machines_v_rels" USING btree ("machine_tags_id");

    ALTER TABLE "pages_rels" ADD COLUMN "machine_tags_id" integer;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_machine_tags_fk" FOREIGN KEY ("machine_tags_id") REFERENCES "public"."machine_tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "pages_rels_machine_tags_id_idx" ON "pages_rels" USING btree ("machine_tags_id");

    ALTER TABLE "_pages_v_rels" ADD COLUMN "machine_tags_id" integer;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_machine_tags_fk" FOREIGN KEY ("machine_tags_id") REFERENCES "public"."machine_tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "_pages_v_rels_machine_tags_id_idx" ON "_pages_v_rels" USING btree ("machine_tags_id");

    -- payload_locked_documents_rels needs a column for every collection —
    -- any doc can be "locked" while being edited in admin.
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "machine_tags_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_machine_tags_fk" FOREIGN KEY ("machine_tags_id") REFERENCES "public"."machine_tags"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_machine_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("machine_tags_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_machine_tags_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "machine_tags_id";
    ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_machine_tags_fk";
    ALTER TABLE "pages_rels" DROP COLUMN "machine_tags_id";
    ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_machine_tags_fk";
    ALTER TABLE "_pages_v_rels" DROP COLUMN "machine_tags_id";
    DROP TABLE "machines_rels" CASCADE;
    DROP TABLE "_machines_v_rels" CASCADE;
    DROP TABLE "machine_tags" CASCADE;
  `)
}
