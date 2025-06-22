/**
 * Helper to handle IPFS URL
 * @param {*} stringUrl
 * @returns
 */
export function rewriteIpfsUrl(url: string) {
  const prefix = 'ipfs://'
  if (!url.startsWith(prefix)) {
    // Not an IPFS URL, return as-is
    return url
  }
  // Strip the ipfs:// scheme and prepend the gateway
  const path = url.slice(prefix.length)
  return `https://ipfs.io/ipfs/${path}`
}

export const getURL = (url?: string) => {
  if (!url) {
    return
  }
  try {
    return new URL(url)
  } catch {
    return
  }
}
