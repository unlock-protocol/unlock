import { OAuthConfig } from '../unlockTypes'

export default function getConfigFromSearch(
  search: any
): OAuthConfig | undefined {
  const { clientId, redirectUri, responseType, code, state } = search
  if (!clientId) {
    // No client id, no OAuth
    return undefined
  }

  const redirectUrl = new URL(redirectUri)
  if (redirectUrl.host !== clientId) {
    console.error(
      "We require clientId to match the redirectUri's host for privacy reasons"
    )
    return undefined
  }

  return {
    clientId,
    responseType,
    state,
  }
}
