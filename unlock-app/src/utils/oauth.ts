import { OAuthConfig } from '../unlockTypes'

export default function getOauthConfigFromQuery(
  search: any
): OAuthConfig | undefined {
  const clientId = search.get('client_id')
  const redirectUri = search.get('redirect_uri')
  const responseType = search.get('response_type')
  const state = search.get('state')
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
    redirectUri,
    clientId,
    responseType,
    state,
  }
}
