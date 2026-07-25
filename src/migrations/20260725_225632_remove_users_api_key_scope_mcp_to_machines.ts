import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "pages_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "insights_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "media_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "categories_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "partners_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "projects_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "faq_items_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_update";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "pages_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "insights_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "media_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "categories_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "partners_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "projects_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "faq_items_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_update" boolean DEFAULT false;`)
}
