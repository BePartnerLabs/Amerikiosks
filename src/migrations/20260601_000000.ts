import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Stale FK from a removed 'services' collection — drop if it still exists
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_services_fk";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Nothing to reverse
}
