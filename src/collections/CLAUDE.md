# Collections

## Enabling `versions: { drafts: true }` on a collection that already has documents

**Turning drafts on requires backfilling version rows in the same migration, or every existing document disappears from `/admin`.**

Payload resolves the admin list of a drafts-enabled collection through `queryDrafts`, which reads **only** the versions table, filtered on `latest = true`:

```js
// @payloadcms/drizzle/dist/queryDrafts.js
const tableName = this.tableNameMap.get(`_${toSnakeCase(collectionConfig.slug)}${this.versionsSuffix}`)
const combinedWhere = combineQueries({ latest: { equals: true } }, where)
```

The generated migration only does `CREATE TABLE "_<collection>_v"` — **empty**. Documents that existed before have no version row, so the admin list returns nothing for them. The frontend keeps working (it queries with `draft: false`, which hits the main table), so the collection looks fine on the site while being invisible to editors.

This bit `brands` on 2026-07-24: 20 brands vanished from `/admin` while the public refund form still listed them. An editor assumed the data was gone and re-created seven by hand, producing duplicate documents. Fixed in `20260728_050000_brands_backfill_versions`, which is the template to copy:

```sql
INSERT INTO "_<collection>_v" (
  "parent_id", "version_<field>"…, "version_updated_at", "version_created_at",
  "version__status", "latest", "created_at", "updated_at"
)
SELECT c."id", c."<field>"…, c."updated_at", c."created_at",
       c."_status"::text::"enum__<collection>_v_version_status",
       true, now(), now()
FROM "<collection>" c
WHERE NOT EXISTS (SELECT 1 FROM "_<collection>_v" v WHERE v."parent_id" = c."id");
```

Verify with `payload.find({ collection, draft: true })` — it must return the same count as `draft: false`. Comparing the two is the cheapest check that a drafts rollout went well.

## `defaultSort` on a column with repeated values

`defaultSort: 'order'` where every row has the same `order` leaves the row order undefined in Postgres. With the admin list paginated, the same document can appear on two pages while another never shows — it reads as duplicated/phantom rows. Always give the sort a tiebreaker: `defaultSort: ['order', 'name']`, and use the same array wherever the frontend queries that collection (see `Brands.ts` and `blocks/ClaimForm/Server.tsx`).
