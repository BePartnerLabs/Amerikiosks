import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_machine_families_sales_class" AS ENUM('frozen', 'hot-food', 'refrigerated', 'ambient-high-volume', 'tight-space');
  CREATE TYPE "public"."enum__machine_families_v_version_sales_class" AS ENUM('frozen', 'hot-food', 'refrigerated', 'ambient-high-volume', 'tight-space');
  ALTER TABLE "machine_families" ADD COLUMN "sales_class" "enum_machine_families_sales_class";
  ALTER TABLE "machine_families" ADD COLUMN "color_step" numeric DEFAULT 0;
  ALTER TABLE "_machine_families_v" ADD COLUMN "version_sales_class" "enum__machine_families_v_version_sales_class";
  ALTER TABLE "_machine_families_v" ADD COLUMN "version_color_step" numeric DEFAULT 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "machine_families" DROP COLUMN "sales_class";
  ALTER TABLE "machine_families" DROP COLUMN "color_step";
  ALTER TABLE "_machine_families_v" DROP COLUMN "version_sales_class";
  ALTER TABLE "_machine_families_v" DROP COLUMN "version_color_step";
  DROP TYPE "public"."enum_machine_families_sales_class";
  DROP TYPE "public"."enum__machine_families_v_version_sales_class";`)
}
