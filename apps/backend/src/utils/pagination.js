/**
 * Cursor-based pagination utility for Prisma queries.
 *
 * Strategy
 * --------
 * We use the record's `id` (UUID) together with `createdAt` as the stable
 * cursor.  The client receives `nextCursor` / `prevCursor` opaque strings in
 * every response and passes them back via `?cursor=<value>&direction=next|prev`.
 *
 * Why cursor-based over offset-based?
 *   - O(log n) seek via index rather than O(n) OFFSET scan.
 *   - Stable pages even when rows are inserted between requests.
 *   - Eliminates the "N+1 COUNT(*)" overhead that offset pagination needs.
 *
 * Memory improvement
 * ------------------
 *   - MAX_PAGE_SIZE caps a single query at 100 rows, so no matter how large
 *     the table grows Node.js never materialises the whole table in a single
 *     JS object graph.
 *   - The Prisma query engine likewise never fetches more than that many rows
 *     per round-trip, keeping the DB result-set buffer small.
 */

/** Hard cap – callers may never exceed this. */
export const MAX_PAGE_SIZE = 100;

/** Default page size when the caller does not specify `limit`. */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Encode a cursor object to a URL-safe base-64 string.
 * @param {{ id: string, createdAt: Date|string }} cursorObj
 * @returns {string}
 */
export function encodeCursor(cursorObj) {
  return Buffer.from(JSON.stringify(cursorObj)).toString("base64url");
}

/**
 * Decode a base-64 cursor string back to a plain object.
 * Returns `null` when the string is absent or malformed.
 * @param {string|undefined} cursorStr
 * @returns {{ id: string, createdAt: string }|null}
 */
export function decodeCursor(cursorStr) {
  if (!cursorStr) return null;
  try {
    return JSON.parse(Buffer.from(cursorStr, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Parse and clamp pagination query parameters from an Express request.
 *
 * Supported query params:
 *   - `limit`     {number}  Records per page  (1–MAX_PAGE_SIZE, default 20)
 *   - `cursor`    {string}  Opaque cursor from a previous response
 *   - `direction` {string}  "next" (default) | "prev"
 *
 * @param {import('express').Request} req
 * @returns {{ limit: number, cursor: object|null, direction: "next"|"prev" }}
 */
export function parsePaginationParams(req) {
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const direction = req.query.direction === "prev" ? "prev" : "next";
  const cursor = decodeCursor(req.query.cursor);

  return { limit, cursor, direction };
}

/**
 * Build the Prisma `cursor`, `skip`, `take`, and `where` additions needed for
 * cursor-based pagination on a model ordered by `createdAt DESC, id DESC`.
 *
 * This function returns **extra args** that should be merged into the caller's
 * Prisma `findMany` arguments.
 *
 * @param {{ limit: number, cursor: object|null, direction: "next"|"prev" }} params
 * @param {object} [existingWhere={}]   The caller's existing `where` clause
 * @returns {object}  Extra Prisma findMany args (cursor, skip, take, where)
 */
export function buildPrismaPageArgs(params, existingWhere = {}) {
  const { limit, cursor, direction } = params;

  // We fetch one extra record so we can detect whether a next/prev page exists
  const take = direction === "prev" ? -(limit + 1) : limit + 1;

  if (!cursor) {
    return { take, where: existingWhere };
  }

  return {
    cursor: { id: cursor.id },
    skip: 1, // skip the cursor record itself
    take,
    where: existingWhere};
}

/**
 * Slice the raw result set (which may have the extra probe record) and build
 * the pagination metadata returned to clients.
 *
 * @param {object[]} rawResults       Array returned by Prisma (length may be limit+1)
 * @param {number}   limit            Requested page size
 * @param {"next"|"prev"} direction
 * @param {string}   [cursorField="id"]  Field used as cursor identifier
 * @returns {{ data: object[], pagination: object }}
 */
export function buildPageResponse(rawResults, limit, direction, cursorField = "id") {
  let items = rawResults;
  let hasMore = false;

  if (direction === "prev") {
    // Prisma returns results in reverse order when take is negative
    items = rawResults.reverse();
  }

  if (items.length > limit) {
    hasMore = true;
    // Drop the probe record
    if (direction === "prev") {
      items = items.slice(1);
    } else {
      items = items.slice(0, limit);
    }
  }

  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  const nextCursor =
    hasMore && direction !== "prev" && lastItem
      ? encodeCursor({ id: lastItem[cursorField], createdAt: lastItem.createdAt })
      : null;

  const prevCursor =
    firstItem
      ? encodeCursor({ id: firstItem[cursorField], createdAt: firstItem.createdAt })
      : null;

  return {
    data: items,
    pagination: {
      limit,
      count: items.length,
      hasNextPage: direction === "next" ? hasMore : true,
      hasPrevPage: direction === "prev" ? hasMore : false,
      nextCursor,
      prevCursor}};
}
