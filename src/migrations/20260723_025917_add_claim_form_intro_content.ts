import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Note: the auto-generated version of this migration also included a large
// batch of statements (claims.refund_method/refund_account, settings.jotform_api_key,
// payment_method enum values, the exports/imports plugin tables, payload_jobs
// task_slug enum) that drizzle-kit's diff proposed because its snapshot state is
// stale — every one of those was already applied to production by earlier
// migrations (verified directly against a prod DB dump). Trimmed down to only
// the genuinely new pieces this migration is meant to add: the claimForm
// block's new introContent richText field.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_claim_form_locales" (
  	"intro_content" jsonb DEFAULT '{"root":{"type":"root","version":1,"direction":null,"format":"","indent":0,"children":[{"type":"heading","tag":"h2","version":1,"children":[{"type":"text","version":1,"text":"Request a Refund"}]},{"type":"paragraph","version":1,"children":[{"type":"text","version":1,"text":"Hi there, please fill out and submit this form to request a refund. This takes less than 2 minutes — you''ll get a copy of your submission by email."}]}]}}'::jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "_pages_v_blocks_claim_form_locales" (
  	"intro_content" jsonb DEFAULT '{"root":{"type":"root","version":1,"direction":null,"format":"","indent":0,"children":[{"type":"heading","tag":"h2","version":1,"children":[{"type":"text","version":1,"text":"Request a Refund"}]},{"type":"paragraph","version":1,"children":[{"type":"text","version":1,"text":"Hi there, please fill out and submit this form to request a refund. This takes less than 2 minutes — you''ll get a copy of your submission by email."}]}]}}'::jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "pages_blocks_claim_form_locales" ADD CONSTRAINT "pages_blocks_claim_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_claim_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_claim_form_locales" ADD CONSTRAINT "_pages_v_blocks_claim_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_claim_form"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_claim_form_locales_locale_parent_id_unique" ON "pages_blocks_claim_form_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_claim_form_locales_locale_parent_id_unique" ON "_pages_v_blocks_claim_form_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_claim_form_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_claim_form_locales" CASCADE;`)
}
