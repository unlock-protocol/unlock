export const getCanonicalCheckoutPath = (id: string) => {
  return `/checkout/${encodeURIComponent(id.trim())}`
}

export const getCanonicalCheckoutUrl = (origin: string, id: string) => {
  return new URL(getCanonicalCheckoutPath(id), origin).toString()
}
