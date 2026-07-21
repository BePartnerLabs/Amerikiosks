import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Hand-trimmed from what `payload migrate:create` generated: Drizzle diffed the
// full DB, not just this change, and bundled in unrelated pre-existing drift
// (DROP TABLE "exports"/"exports_texts"/"imports", and payload_jobs task_slug
// enum rebuilds) that has nothing to do with Claims — investigate that drift
// separately before it ships in any migration. This file only adds what this
// change actually needs: the refundMethod/refundAccount fields and the two new
// paymentMethod options (Google Pay, Apple Pay).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_claims_refund_method" AS ENUM('Zelle', 'CashApp', 'Paypal', 'Venmo');
  ALTER TYPE "public"."enum_claims_payment_method" ADD VALUE 'google_pay';
  ALTER TYPE "public"."enum_claims_payment_method" ADD VALUE 'apple_pay';
  ALTER TABLE "claims" ADD COLUMN "refund_method" "enum_claims_refund_method";
  ALTER TABLE "claims" ADD COLUMN "refund_account" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "claims" ALTER COLUMN "payment_method" SET DATA TYPE text;
  DROP TYPE "public"."enum_claims_payment_method";
  CREATE TYPE "public"."enum_claims_payment_method" AS ENUM('card', 'cash');
  ALTER TABLE "claims" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_claims_payment_method" USING "payment_method"::"public"."enum_claims_payment_method";
  ALTER TABLE "claims" DROP COLUMN "refund_method";
  ALTER TABLE "claims" DROP COLUMN "refund_account";
  DROP TYPE "public"."enum_claims_refund_method";`)
}
