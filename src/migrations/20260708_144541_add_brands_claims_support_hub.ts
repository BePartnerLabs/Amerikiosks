import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_claims_payment_method" AS ENUM('card', 'cash');
  CREATE TYPE "public"."enum_claims_claim_reason" AS ENUM('partial_dispense', 'damaged_product', 'wrong_product', 'no_product');
  CREATE TYPE "public"."enum_claims_integration_target" AS ENUM('jotform', 'odoo');
  CREATE TYPE "public"."enum_claims_sync_status" AS ENUM('pending', 'synced', 'error');
  CREATE TABLE "pages_blocks_claim_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"submit_button_label" varchar DEFAULT 'Submit claim',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_support_hub" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phone_number" varchar DEFAULT '+18885093699',
  	"whatsapp_number" varchar DEFAULT '+18885093699',
  	"refund_form_url" varchar DEFAULT '/customer-service/request-a-refund',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_claim_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"submit_button_label" varchar DEFAULT 'Submit claim',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_support_hub" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone_number" varchar DEFAULT '+18885093699',
  	"whatsapp_number" varchar DEFAULT '+18885093699',
  	"refund_form_url" varchar DEFAULT '/customer-service/request-a-refund',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "claims" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kiosk_brand_id" integer NOT NULL,
  	"payment_method" "enum_claims_payment_method" NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"transaction_date_time" timestamp(3) with time zone NOT NULL,
  	"location_state" varchar NOT NULL,
  	"location_city" varchar NOT NULL,
  	"location_property_name" varchar NOT NULL,
  	"claim_reason" "enum_claims_claim_reason" NOT NULL,
  	"additional_info" varchar,
  	"last_four_card_digits" varchar,
  	"photo_id" integer,
  	"machine_id" varchar,
  	"integration_target" "enum_claims_integration_target" DEFAULT 'jotform',
  	"sync_status" "enum_claims_sync_status" DEFAULT 'pending',
  	"sync_error" varchar,
  	"synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "brands_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "claims_id" integer;
  ALTER TABLE "pages_blocks_claim_form" ADD CONSTRAINT "pages_blocks_claim_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_support_hub" ADD CONSTRAINT "pages_blocks_support_hub_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_claim_form" ADD CONSTRAINT "_pages_v_blocks_claim_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_support_hub" ADD CONSTRAINT "_pages_v_blocks_support_hub_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_kiosk_brand_id_brands_id_fk" FOREIGN KEY ("kiosk_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_claim_form_order_idx" ON "pages_blocks_claim_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_claim_form_parent_id_idx" ON "pages_blocks_claim_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_claim_form_path_idx" ON "pages_blocks_claim_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_support_hub_order_idx" ON "pages_blocks_support_hub" USING btree ("_order");
  CREATE INDEX "pages_blocks_support_hub_parent_id_idx" ON "pages_blocks_support_hub" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_support_hub_path_idx" ON "pages_blocks_support_hub" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_claim_form_order_idx" ON "_pages_v_blocks_claim_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_claim_form_parent_id_idx" ON "_pages_v_blocks_claim_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_claim_form_path_idx" ON "_pages_v_blocks_claim_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_support_hub_order_idx" ON "_pages_v_blocks_support_hub" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_support_hub_parent_id_idx" ON "_pages_v_blocks_support_hub" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_support_hub_path_idx" ON "_pages_v_blocks_support_hub" USING btree ("_path");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "claims_kiosk_brand_idx" ON "claims" USING btree ("kiosk_brand_id");
  CREATE INDEX "claims_photo_idx" ON "claims" USING btree ("photo_id");
  CREATE INDEX "claims_updated_at_idx" ON "claims" USING btree ("updated_at");
  CREATE INDEX "claims_created_at_idx" ON "claims" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("claims_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_claim_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_support_hub" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_claim_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_support_hub" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "claims" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_claim_form" CASCADE;
  DROP TABLE "pages_blocks_support_hub" CASCADE;
  DROP TABLE "_pages_v_blocks_claim_form" CASCADE;
  DROP TABLE "_pages_v_blocks_support_hub" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "claims" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_brands_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_claims_fk";
  
  DROP INDEX "payload_locked_documents_rels_brands_id_idx";
  DROP INDEX "payload_locked_documents_rels_claims_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "brands_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "claims_id";
  DROP TYPE "public"."enum_claims_payment_method";
  DROP TYPE "public"."enum_claims_claim_reason";
  DROP TYPE "public"."enum_claims_integration_target";
  DROP TYPE "public"."enum_claims_sync_status";`)
}
