import { generateNonce, SiweMessage } from 'siwe'
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

export function createMessageToSignIn({
  clientId,
  statement,
  address,
  chainId,
}: {
  clientId: string
  statement: string
  address: string
  chainId: number
}) {
  const nonce = generateNonce()
  const expirationDate = new Date()
  // Add 7 day expiration from today. This will account for months.
  expirationDate.setDate(expirationDate.getDate() + 7)

  const message = new SiweMessage({
    nonce,
    domain: clientId,
    statement: statement.trim(),
    uri: 'https://app.unlock-protocol.com/login',
    version: '1',
    address,
    chainId,
    expirationTime: expirationDate.toISOString(),
  })

  return message.prepareMessage()
}
