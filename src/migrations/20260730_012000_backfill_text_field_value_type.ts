import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Backfills `value_type` on existing text fields from the type of the Monday
 * column each one targets.
 *
 * `value_type` was added with DEFAULT 'text', so every field that existed
 * before it — including the four phone fields on the client's live forms — came
 * out typed as plain text. That silently disables the normalisation those
 * fields need: Monday's `phone` column rejects a formatted number, so a visitor
 * typing "(512) 555-0101" produces a value the whole item fails on, and the
 * lead is lost with nothing but `syncStatus: 'error'` to show for it. The exact
 * failure that commit ffd890a fixed for claims.
 *
 * Verified against a production restore: all four phone fields (Contact,
 * Placement Application, Design your Kiosk, Start developing your kiosk) point
 * at columns Monday reports as type `phone`.
 *
 * The mapping is read from the cached board schema rather than guessed from
 * field names — a field called "phone" pointed at a text column must stay
 * `text`, and column ids are only unique *within* a board, hence the join
 * through each form's own board id. With no cache present the whole statement
 * matches nothing and the migration is a no-op.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "forms_blocks_text" t
    SET "value_type" = m.value_type::"enum_forms_blocks_text_value_type"
    FROM "forms" f,
      (
        SELECT b->>'id' AS board_id,
               c->>'id' AS column_id,
               CASE c->>'type'
                 WHEN 'phone' THEN 'phone'
                 WHEN 'link' THEN 'website'
               END AS value_type
        FROM "settings" s,
          jsonb_array_elements(s."monday_boards_cache" -> 'boards') b,
          jsonb_array_elements(b -> 'columns') c
        WHERE c->>'type' IN ('phone', 'link')
      ) m
    WHERE t."_parent_id" = f."id"
      AND f."external_id" = m.board_id
      AND t."external_id" = m.column_id
      AND t."value_type" = 'text';
  `)
}

/**
 * Intentionally a no-op: this migration only reclassifies existing rows, and
 * resetting them to 'text' on the way down would undo an editor's later
 * correction in /admin as well as this backfill.
 */
export async function down(_args: MigrateDownArgs): Promise<void> {}
