import { Env, ForwardingResult, RpcRequest } from './types'
import supportedNetworks, { getFallbackProviders } from './supportedNetworks'

// 5 s per attempt × 3 max attempts = 15 s worst-case, well within the CF Workers 30 s wall-clock limit.
const FETCH_TIMEOUT_MS = 5_000

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
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

    let response: Response | null = null
    try {
      response = await fetchFromProvider(primaryUrl, requestsToForward)
    } catch (error) {
      console.warn(
        `Primary provider for network ${networkId} threw, trying fallbacks:`,
        error
      )
    }

    // Fall back on 5xx server errors and 429 (rate-limit is provider-specific, so another provider may succeed).
    // Other 4xx errors from the primary (including 404) surface immediately — a 404 from Alchemy on a
    // supported chain indicates a misconfiguration beyond the SSL issue this fallback chain is designed to fix.
    // Note: 404 from a *fallback* provider is treated differently (skipped, not definitive) — see the
    // isDefinitiveClientError condition inside the loop, which treats fallback 404 as endpoint misconfiguration.
    if (!response || response.status >= 500 || response.status === 429) {
      for (const fallbackUrl of getFallbackProviders(networkId)) {
        console.info(
          `Previous attempt for network ${networkId} ${response ? `returned HTTP ${response.status}` : 'threw'}, trying next fallback: ${fallbackUrl}`
        )
        // Cancel the unconsumed body before overwriting the response reference to
        // avoid holding open the connection in the Cloudflare Workers runtime.
        response?.body?.cancel()
        try {
          response = await fetchFromProvider(fallbackUrl, requestsToForward)
        } catch (error) {
          console.warn(
            `Fallback provider for network ${networkId} threw, moving to next fallback: ${fallbackUrl}`,
            error
          )
          response = null
          continue
        }

        // Stop on success (2xx) or definitive client errors where no provider could help.
        // Continue on 429 (rate-limit) and 404 (likely provider endpoint misconfiguration).
        const isDefinitiveClientError =
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429 &&
          response.status !== 404
        if (response.ok || isDefinitiveClientError) break
      }
    }

    if (!response || !response.ok) {
      response?.body?.cancel()
      return {
        error: {
          message: response
            ? `Provider returned HTTP ${response.status}`
            : 'All providers failed with network errors',
          originalError: response
            ? new Error(`HTTP ${response.status}`)
            : new Error('All providers threw network errors'),
          status: response?.status,
        },
      }
    }

    let providerResponse
    try {
      // Use text() + JSON.parse rather than response.json() so parse errors include
      // the raw response body, making malformed-response debugging easier.
      const responseText = await response.text()
      providerResponse = JSON.parse(responseText)
    } catch (error) {
      console.error('Error parsing JSON response:', error)
      return {
        error: {
          message: 'Failed to parse provider response',
          originalError: error,
          status: response.status,
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
