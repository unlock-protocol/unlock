import { Env } from './types'
import { getClientIP, RpcRequest } from './utils'
import { getRPCResponseFromCache, storeRPCResponseInCache } from './cache'
import { shouldRateLimit } from './rateLimit'

/**
 * Represents the result of processing a single RPC request
 */
interface ProcessedRequest {
  request: RpcRequest
  response: any | null
  shouldForward: boolean
  rateLimited: boolean
}

/**
 * Represents the result of processing a batch of RPC requests
 */
interface BatchProcessingResult {
  processedRequests: ProcessedRequest[]
  requestsToForward: RpcRequest[]
}

/**
 * Creates a standardized JSON-RPC error response
 *
 * @param id The request ID
 * @param code The error code
 * @param message The error message
 * @param data Additional error data
 * @returns A standardized JSON-RPC error response object
 */
export const createErrorResponse = (
  id: number | string = 42,
  code: number = -32603,
  message: string = 'Internal JSON-RPC error',
  data: string = 'Unknown error'
): any => {
  return {
    id,
    jsonrpc: '2.0',
    error: {
      code,
      message,
      data,
    },
  }
}

/**
 * Process a chainId request locally
 * @param request The RPC request
 * @param networkId The network ID
 * @returns The RPC response
 */
export const processChainIdRequest = (
  request: RpcRequest,
  networkId: string
): any => {
  return {
    id: request.id,
    jsonrpc: '2.0',
    result: `0x${parseInt(networkId).toString(16)}`,
  }
}

/**
 * Process a single RPC request
 * This function determines if the request can be handled locally or needs to be forwarded
 *
 * @param request The RPC request to process
 * @param networkId The network ID
 * @param originalRequest The original HTTP request
 * @param env The environment variables
 * @returns A ProcessedRequest object with the result and forwarding flag
 */
export const processSingleRequest = async (
  request: RpcRequest,
  networkId: string,
  originalRequest: Request,
  env: Env
): Promise<ProcessedRequest> => {
  // Check if this is a chainId request that can be handled locally
  if (request.method?.toLowerCase().trim() === 'eth_chainid') {
    return {
      request,
      response: processChainIdRequest(request, networkId),
      shouldForward: false,
      rateLimited: false,
    }
  }

  // Check if this request is rate limited
  const isRateLimited = await shouldRateLimit(
    originalRequest,
    env,
    request,
    networkId
  )

  if (isRateLimited) {
    // Log the rate limit but still forward the request to maintain current behavior
    // This would later be changed to block rate-limited requests
    console.log(
      `RATE_LIMIT_WOULD_BLOCK: IP=${getClientIP(originalRequest)}, networkId=${networkId}, Request ID=${request.id}, Method=${request.method}`
    )

    return {
      request,
      response: null,
      shouldForward: true,
      rateLimited: true,
    }
  }

  // Check if this request can be served from cache
  const cachedResponse = await getRPCResponseFromCache(
    networkId,
    request,
    originalRequest
  )

  if (cachedResponse) {
    // Parse the cached response body
    const cachedBody = await cachedResponse.json()
    return {
      request,
      response: cachedBody,
      shouldForward: false,
      rateLimited: false,
    }
  }

  // If we reach here, the request needs to be forwarded to the provider
  return {
    request,
    response: null,
    shouldForward: true,
    rateLimited: false,
  }
}

/**
 * Process a batch of RPC requests
 * This function processes each request in the batch and determines which ones
 * can be handled locally and which need to be forwarded to the provider
 *
 * @param requests The array of RPC requests to process
 * @param networkId The network ID
 * @param originalRequest The original HTTP request
 * @param env The environment variables
 * @returns A BatchProcessingResult object with the processed requests and requests to forward
 */
export const processBatchRequests = async (
  requests: RpcRequest[],
  networkId: string,
  originalRequest: Request,
  env: Env
): Promise<BatchProcessingResult> => {
  // process all requests
  const processedRequests: ProcessedRequest[] = await Promise.all(
    requests.map((request) =>
      processSingleRequest(request, networkId, originalRequest, env)
    )
  )

  // Extract requests that need to be forwarded
  const requestsToForward = processedRequests
    .filter((processed) => processed.shouldForward)
    .map((processed) => processed.request)

  return {
    processedRequests,
    requestsToForward,
  }
}

/**
 * Combine the locally processed responses with the responses from the provider
 *
 * @param processedRequests The array of processed requests
 * @param providerResponses The responses from the provider (if any)
 * @returns An array of combined responses in the same order as the original batch
 */
export const combineResponses = (
  processedRequests: ProcessedRequest[],
  providerResponses: any[] | null
): any[] => {
  // a map of provider responses by request ID for quick lookup
  const responseMap = new Map<number | string, any>()

  if (providerResponses) {
    providerResponses.forEach((response) => {
      if (response && typeof response === 'object' && 'id' in response) {
        responseMap.set(response.id, response)
      }
    })
  }

  // Combine the responses in the same order as the original batch
  return processedRequests.map((processed) => {
    // If the request was processed locally, use that response
    if (!processed.shouldForward) {
      return processed.response
    }

    // Otherwise, look up the response from the provider
    const providerResponse = responseMap.get(processed.request.id)

    // If we couldn't find a matching response, return an error
    if (!providerResponse) {
      return {
        id: processed.request.id,
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal JSON-RPC error',
          data: 'No response received from provider for this request',
        },
      }
    }

    return providerResponse
  })
}

/**
 * Forwards requests to the provider and caches the responses
 *
 * @param requestsToForward The requests to forward to the provider
 * @param networkId The network ID
 * @param env The environment variables
 * @returns The provider responses
 */
export const forwardRequestsToProvider = async (
  requestsToForward: RpcRequest[],
  networkId: string,
  env: Env
): Promise<any> => {
  if (requestsToForward.length === 0) {
    return null
  }

  // Determine if this is a single request or a batch
  const isBatchRequest = requestsToForward.length > 1
  const forwardBody = isBatchRequest ? requestsToForward : requestsToForward[0]

  // Get the appropriate provider URL for the network
  const providerKey = `${networkId.toUpperCase()}_PROVIDER`
  const supportedNetwork = env[providerKey as keyof Env] as string

  // Forward the request to the provider
  const response = await fetch(supportedNetwork, {
    method: 'POST',
    body: JSON.stringify(forwardBody),
    headers: new Headers({
      Accept: '*/*',
      Origin: 'https://rpc.unlock-protocol.com/',
      'Content-Type': 'application/json',
    }),
  })

  // Parse the response
  let providerResponse
  try {
    providerResponse = await response.json()
  } catch (error) {
    console.error('Error parsing JSON response:', error)
    throw error
  }

  // Store the response in the cache if applicable
  await storeRPCResponseInCache(networkId, forwardBody, providerResponse, env)

  return providerResponse
}
