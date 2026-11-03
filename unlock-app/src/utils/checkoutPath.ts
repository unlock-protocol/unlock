/**
 * Helpers for the path-based checkout URL: `/checkout/<id>`.
 *
 * The legacy form `/checkout?id=<id>` keeps working: `middleware.ts`
 * permanently redirects it to the path-based form. Checkouts that do not use a
 * saved config id (for example `?paywallConfig={...}`) are never redirected.
 *
 * This module is pure (no imports) so it can be used from the middleware,
 * server components, client components and tests alike.
 */

// Saved checkout config ids are opaque strings. Only ids made of URL-safe
// characters are redirected, anything else is served as before.
const CHECKOUT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

export const isCheckoutId = (id?: string | null): id is string =>
  typeof id === 'string' && CHECKOUT_ID_PATTERN.test(id)

export const getCheckoutPath = (id: string) =>
  `/checkout/${encodeURIComponent(id)}`

/**
 * Returns the path (plus remaining query string) the legacy URL should be
 * redirected to, or `null` when the request is not a legacy `?id=` URL.
 * Every query parameter other than `id` is preserved, in order. When `id` is
 * repeated the first value wins, like `searchParams.get('id')` does in the
 * checkout page.
 */
export const getLegacyCheckoutRedirect = (
  searchParams: URLSearchParams
): string | null => {
  const id = searchParams.get('id')?.trim()

  if (!isCheckoutId(id)) {
    return null
  }

  const rest = new URLSearchParams(searchParams)
  rest.delete('id')

  const query = rest.toString()
  return `${getCheckoutPath(id)}${query ? `?${query}` : ''}`
}
