import { Env, ForwardingResult, RpcRequest } from './types'
import supportedNetworks, { getFallbackProviders } from './supportedNetworks'

// AbortSignal.timeout aborts the entire fetch lifecycle (connection, headers, and body streaming).
// 5 s is tuned for Alchemy; public fallback RPCs (publicProvider, 1RPC) can be slower.
// 3 providers × 5 s = 15 s worst-case — within the CF Workers 30 s wall-clock limit.
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
    let triedFallbacks = false
    try {
      response = await fetchFromProvider(primaryUrl, requestsToForward)
    } catch (error) {
      console.warn(
        `Primary provider for network ${networkId} threw, trying fallbacks:`,
        error
      )
    }

    // Fall back on 5xx server errors, 429 (rate-limit is provider-specific), and 404 (provider may be
    // misconfigured at the endpoint level — another provider may still succeed).
    // Other 4xx errors (403, 400, etc.) surface immediately — they indicate a request-level problem
    // that no provider can resolve differently.
    if (
      !response ||
      response.status >= 500 ||
      response.status === 429 ||
      response.status === 404
    ) {
      for (const fallbackUrl of getFallbackProviders(networkId)) {
        triedFallbacks = true
        console.info(
          `Previous attempt for network ${networkId} ${response ? `returned HTTP ${response.status}` : 'threw'}, trying next fallback: ${fallbackUrl}`
        )
        // `response` here is always the previous attempt's response (or null if it threw).
        // Cancel its unconsumed body before overwriting the reference — holding an open
        // ReadableStream keeps the upstream connection alive in the CF Workers runtime.
        await response?.body?.cancel()
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
        // Continue on 429 (rate-limit) and 404 (endpoint misconfiguration — try next provider).
        const isDefinitiveClientError =
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429 &&
          response.status !== 404
        if (response.ok || isDefinitiveClientError) break
      }
    }

    if (!response || !response.ok) {
      await response?.body?.cancel()
      return {
        error: {
          message: response
            ? `Provider returned HTTP ${response.status}`
            : triedFallbacks
              ? 'All providers failed with network errors'
              : 'Provider failed with a network error',
          originalError: response
            ? new Error(`HTTP ${response.status}`)
            : new Error('Provider threw a network error'),
          status: response?.status,
        },
      }
    }

    let providerResponse
    let responseText = ''
    try {
      // Use text() + JSON.parse rather than response.json() so parse errors include
      // the raw response body, making malformed-response debugging easier.
      // A 200 with a non-JSON body (e.g. a CDN HTML error page) returns an error here
      // without retrying fallbacks — 200 means the provider accepted the request.
      responseText = await response.text()
      providerResponse = JSON.parse(responseText)
    } catch (error) {
      console.error(
        'Error parsing JSON response:',
        error,
        'Raw body:',
        responseText
      )
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
