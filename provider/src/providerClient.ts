// ABOUTME: Forwards RPC requests to the upstream provider, with fallback for providers
// that fail due to Cloudflare CDN SSL issues (HTTP 525) on certain chain endpoints.
import { Env, ForwardingResult, RpcRequest } from './types'
import supportedNetworks, { fallbackProvider } from './supportedNetworks'

const fetchFromProvider = async (
  url: string,
  requestsToForward: RpcRequest[]
): Promise<Response> => {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(requestsToForward),
    headers: new Headers({
      Accept: '*/*',
      Origin: 'https://rpc.unlock-protocol.com/',
      'Content-Type': 'application/json',
    }),
  })
}

/**
 * Forwards requests to the provider, with fallback to public RPC on non-OK response
 *
 * @param requestsToForward The requests to forward to the provider
 * @param networkId The network ID
 * @param env The environment variables
 * @returns A ForwardingResult containing either the responses or an error
 */
export const forwardRequestsToProvider = async (
  requestsToForward: RpcRequest[],
  networkId: string,
  env: Env
): Promise<ForwardingResult> => {
  if (requestsToForward.length === 0) {
    return { responses: [] }
  }

  try {
    const primaryUrl = supportedNetworks(env, networkId)
    let response = await fetchFromProvider(primaryUrl!, requestsToForward)

    if (!response.ok) {
      const fallbackUrl = fallbackProvider(networkId)
      if (fallbackUrl) {
        console.warn(
          `Primary provider for network ${networkId} returned HTTP ${response.status}, falling back to public endpoint`
        )
        response = await fetchFromProvider(fallbackUrl, requestsToForward)
      }
    }

    if (!response.ok) {
      return {
        error: {
          message: `Provider returned HTTP ${response.status}`,
          originalError: new Error(`HTTP ${response.status}`),
        },
      }
    }

    let providerResponse
    try {
      const responseText = await response.text()
      providerResponse = JSON.parse(responseText)
    } catch (error) {
      console.error('Error parsing JSON response:', error)
      return {
        error: {
          message: 'Failed to parse provider response',
          originalError: error,
        },
      }
    }

    // Convert single response to array if needed
    const responsesArray = Array.isArray(providerResponse)
      ? providerResponse
      : [providerResponse]

    return { responses: responsesArray }
  } catch (error) {
    console.error('Error forwarding requests to provider:', error)
    return {
      error: {
        message: 'Failed to forward requests to provider',
        originalError: error,
      },
    }
  }
}
