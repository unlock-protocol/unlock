import {
  ProcessedRequest,
  RpcRequest,
  Env,
  BatchProcessingResult,
} from './types'
import { shouldRateLimit } from './rateLimit'
import { getClientIP } from './utils'

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

    // TODO: This return should be replaced with a rate limit error response
    // when we start enforcing rate limiting
    return {
      request,
      response: null,
      shouldForward: true,
      rateLimited: true,
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
