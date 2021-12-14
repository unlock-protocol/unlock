import { OAuthConfig } from '../unlockTypes'

export default function getConfigFromSearch(
  search: any
): OAuthConfig | undefined {
  const { client_id, redirect_uri, response_type, state } = search
  if (!client_id) {
    // No client id, no OAuth
    return undefined
  }

  const redirectUrl = new URL(redirect_uri)
  if (redirectUrl.host !== client_id) {
    console.error(
      "We require clientId to match the redirectUri's host for privacy reasons"
    )
    return undefined
  }

  return {
    redirectUri: redirect_uri,
    clientId: client_id,
    responseType: response_type,
    state,
  }
}
