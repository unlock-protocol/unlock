/**
 * Helper to handle IPFS URL
 * @param {*} stringUrl
 * @returns
 */
export const rewriteIpfsUrl = (stringUrl: string) => {
  try {
    const url: URL = new URL(stringUrl)
    // Handling IPFS addresses
    // TODO: add detection when IPFS is supported!
    if (url.protocol === 'ipfs:') {
      const path = `/ipfs${url.pathname}`
      url.protocol = 'https:'
      url.hostname = 'cloudflare-ipfs.com'
      url.pathname = path
    }
    return url.toString()
  } catch (error) {
    console.error(`Error handling ${stringUrl}`)
    return stringUrl
  }
}
