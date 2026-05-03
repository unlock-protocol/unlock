import { Env, ForwardingResult, RpcRequest } from './types'
import supportedNetworks, { getFallbackProviders } from './supportedNetworks'

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
    if (!primaryUrl) {
      return {
        error: {
          message: `Unsupported network: ${networkId}`,
          originalError: new Error('Unsupported network'),
        },
      }
    }

    let response: Response
    try {
      response = await fetchFromProvider(primaryUrl, requestsToForward)
    } catch (error) {
      console.warn(
        `Primary provider for network ${networkId} threw, trying fallbacks:`,
        error
      )
      // Synthesize a 503 so the fallback loop below is entered
      response = new Response('', { status: 503 })
    }

    // Only fall back on 5xx server errors — 4xx errors (auth, rate-limit) should surface to the caller
    if (response.status >= 500) {
      for (const fallbackUrl of getFallbackProviders(networkId)) {
        console.warn(
          `Provider for network ${networkId} returned HTTP ${response.status}, trying fallback: ${fallbackUrl}`
        )
        try {
          response = await fetchFromProvider(fallbackUrl, requestsToForward)
        } catch (error) {
          console.warn(
            `Fallback provider for network ${networkId} threw, trying next fallback: ${fallbackUrl}`,
            error
          )
          continue
        }

        if (response.status < 500) break
      }
    }

    if (!response.ok) {
      return {
        error: {
          message: `Provider returned HTTP ${response.status}`,
          originalError: new Error(`HTTP ${response.status}`),
          status: response.status,
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
