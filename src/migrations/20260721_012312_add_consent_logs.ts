import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "consent_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"consent_id" varchar NOT NULL,
  	"analytics" boolean DEFAULT false NOT NULL,
  	"policy_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "consent_logs_id" integer;
  CREATE UNIQUE INDEX "consent_logs_consent_id_idx" ON "consent_logs" USING btree ("consent_id");
  CREATE INDEX "consent_logs_updated_at_idx" ON "consent_logs" USING btree ("updated_at");
  CREATE INDEX "consent_logs_created_at_idx" ON "consent_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consent_logs_fk" FOREIGN KEY ("consent_logs_id") REFERENCES "public"."consent_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_consent_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("consent_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "consent_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "consent_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_consent_logs_fk";

  DROP INDEX "payload_locked_documents_rels_consent_logs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "consent_logs_id";`)
}
