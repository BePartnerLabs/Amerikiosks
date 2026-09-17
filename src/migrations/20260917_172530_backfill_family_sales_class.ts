import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Siembra `salesClass` y el `colorStep` de Delta en las familias que ya existen.
 *
 * `salesClass` nace requerido, y `required` en Payload es validación de
 * aplicación, no una restricción de base: la columna se crea nullable, la
 * migración de esquema no falla, y nada parece roto. Lo que se rompe es el
 * panel — un editor que abre CUALQUIER familia no puede guardar nada, ni una
 * coma de copy, hasta elegir una clase que nadie le dijo que le tocaba elegir.
 * Y `payload-types.ts` declara `salesClass` sin `| null` por ser requerido, así
 * que una columna vacía en producción deja al front rompiéndose con un
 * `undefined` que TypeScript juró imposible.
 *
 * Por qué esto va en una migración y no por `/admin`: no es contenido. Nadie
 * decide nada acá — los valores salen de la hoja comparativa del cliente y de
 * qué vende cada línea. La regla del proyecto («el contenido no va por
 * migración») separa redactar contenido, que va por `/admin`, de poner en regla
 * filas que ya existen frente a una restricción que la migración misma acaba de
 * introducir, que es parte del cambio de esquema. Mismo caso que
 * 20260730_012000_backfill_text_field_value_type y 20260728_050000_brands_backfill_versions.
 * Ver docs/patterns/payload-seeding.md.
 *
 * Se escribe en LAS DOS tablas porque `machine-families` tiene `drafts: true`:
 * el front lee `machine_families`, pero `/admin` lee la fila `latest` de
 * `_machine_families_v` por `queryDrafts`. Sembrar solo la principal deja al
 * editor viendo el campo vacío igual — exactamente el incidente de brands.
 * El historial de versiones se deja como está: es historial.
 *
 * Clave por `slug` y no por `id`: los ids son por entorno. Guardas `IS NULL`
 * para que re-ejecutarla sea un no-op y para no pisar un valor que alguien ya
 * corrigió a mano.
 *
 * LÍMITE CONOCIDO: solo siembra lo que existía cuando se escribió. Sigma no
 * estaba en el dump contra el que se probó —se creó en producción más tarde el
 * mismo día— así que su fila nunca se ejercitó en el round-trip. Se cubre en
 * docs/post-release-admin.md, sección 7.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "machine_families" f
    SET "sales_class" = v.sales_class::"enum_machine_families_sales_class"
    FROM (VALUES
      ('sigma', 'frozen'),
      ('alpha', 'hot-food'),
      ('kappa', 'refrigerated'),
      ('gamma', 'ambient-high-volume'),
      ('zeta', 'tight-space'),
      ('delta', 'tight-space')
    ) AS v(slug, sales_class)
    WHERE f."slug" = v.slug
      AND f."sales_class" IS NULL;
  `)

  // Delta comparte "espacio chico" con Zeta. El paso de rampa es lo único que
  // las distingue en la grilla donde el visitante elige; con las dos en 0 se
  // ven idénticas, que es el bug que el campo existe para evitar.
  await db.execute(sql`
    UPDATE "machine_families"
    SET "color_step" = 1
    WHERE "slug" = 'delta'
      AND "color_step" IS NOT DISTINCT FROM 0;
  `)

  await db.execute(sql`
    UPDATE "_machine_families_v" v
    SET "version_sales_class" =
          f."sales_class"::text::"enum__machine_families_v_version_sales_class",
        "version_color_step" = f."color_step"
    FROM "machine_families" f
    WHERE v."parent_id" = f."id"
      AND v."latest" IS TRUE
      AND f."sales_class" IS NOT NULL
      AND v."version_sales_class" IS NULL;
  `)
}

/**
 * No destructivo a propósito. La migración de esquema que va antes que esta se
 * lleva las dos columnas al bajar, así que no hay nada que deshacer; y vaciarlas
 * acá descartaría también la corrección que un editor haya hecho después.
 */
export async function down(_args: MigrateDownArgs): Promise<void> {}
