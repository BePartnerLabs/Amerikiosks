import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_claim_form_locales" ADD COLUMN "credits_available_yes_message" varchar DEFAULT 'Great! Please press "change" to receive a refund, or select a product and click "Place Order" to continue with the transaction.';
  ALTER TABLE "pages_blocks_claim_form_locales" ADD COLUMN "credits_available_no_message" varchar DEFAULT 'We are sorry to hear that. Please continue to provide us with your personal information so our team can issue a refund.';
  ALTER TABLE "pages_blocks_claim_form_locales" ADD COLUMN "additional_info_hint" varchar DEFAULT 'Please provide details on the issue. What products were you trying to purchase? Did the machine show any messages on the screen? This feedback is optional and it helps us to improve our service.';
  ALTER TABLE "_pages_v_blocks_claim_form_locales" ADD COLUMN "credits_available_yes_message" varchar DEFAULT 'Great! Please press "change" to receive a refund, or select a product and click "Place Order" to continue with the transaction.';
  ALTER TABLE "_pages_v_blocks_claim_form_locales" ADD COLUMN "credits_available_no_message" varchar DEFAULT 'We are sorry to hear that. Please continue to provide us with your personal information so our team can issue a refund.';
  ALTER TABLE "_pages_v_blocks_claim_form_locales" ADD COLUMN "additional_info_hint" varchar DEFAULT 'Please provide details on the issue. What products were you trying to purchase? Did the machine show any messages on the screen? This feedback is optional and it helps us to improve our service.';
  ALTER TABLE "claims" ADD COLUMN "location" varchar NOT NULL;
  ALTER TABLE "claims" DROP COLUMN "location_state";
  ALTER TABLE "claims" DROP COLUMN "location_city";
  ALTER TABLE "claims" DROP COLUMN "location_property_name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "claims" ADD COLUMN "location_state" varchar NOT NULL;
  ALTER TABLE "claims" ADD COLUMN "location_city" varchar NOT NULL;
  ALTER TABLE "claims" ADD COLUMN "location_property_name" varchar NOT NULL;
  ALTER TABLE "pages_blocks_claim_form_locales" DROP COLUMN "credits_available_yes_message";
  ALTER TABLE "pages_blocks_claim_form_locales" DROP COLUMN "credits_available_no_message";
  ALTER TABLE "pages_blocks_claim_form_locales" DROP COLUMN "additional_info_hint";
  ALTER TABLE "_pages_v_blocks_claim_form_locales" DROP COLUMN "credits_available_yes_message";
  ALTER TABLE "_pages_v_blocks_claim_form_locales" DROP COLUMN "credits_available_no_message";
  ALTER TABLE "_pages_v_blocks_claim_form_locales" DROP COLUMN "additional_info_hint";
  ALTER TABLE "claims" DROP COLUMN "location";`)
}
