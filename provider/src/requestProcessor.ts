import {
  ProcessedRequest,
  RpcRequest,
  Env,
  BatchProcessingResult,
} from './types'
import { shouldRateLimit } from './rateLimit'
import { getCachedResponseForRequest } from './cache'
import { getClientIP } from './utils'

/**
 * Process a chainId request locally
 * @param request The RPC request
 * @param chainId The chain ID
 * @returns The RPC response
 */
export const processChainIdRequest = (
  request: RpcRequest,
  chainId: string
): any => {
  return {
    id: request.id,
    jsonrpc: '2.0',
    result: `0x${parseInt(chainId).toString(16)}`,
  }
}

/**
 * JSON-RPC error returned for rate limited requests.
 * -32005 is the code clients such as viem and ethers treat as "limit exceeded".
 */
export const createRateLimitedResponse = (request: RpcRequest): any => {
  return {
    id: request.id,
    jsonrpc: '2.0',
    error: { code: -32005, message: 'Rate limit exceeded' },
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
  chainId: string,
  originalRequest: Request,
  env: Env
): Promise<ProcessedRequest> => {
  // Check if this is a chainId request that can be handled locally
  if (request.method?.toLowerCase().trim() === 'eth_chainid') {
    return {
      request,
      response: processChainIdRequest(request, chainId),
      shouldForward: false,
      rateLimited: false,
    }
  }

  // Check if this request is cached
  const cachedResponse = await getCachedResponseForRequest(
    request,
    chainId,
    env
  )
  if (cachedResponse) {
    return {
      request,
      response: cachedResponse,
      shouldForward: false,
      rateLimited: false,
      fromCache: true,
    }
  }

  // Check if this request is rate limited
  const isRateLimited = await shouldRateLimit(
    originalRequest,
    env,
    request,
    chainId
  )

  if (isRateLimited) {
    const logDetails = `IP=${getClientIP(originalRequest)}, networkId=${chainId}, Request ID=${request.id}, Method=${request.method}`

    // Block the request unless the rate limiter is in log-only mode
    if (env.RATE_LIMIT_MODE === 'enforce') {
      console.log(`RATE_LIMIT_BLOCKED: ${logDetails}`)
      return {
        request,
        response: createRateLimitedResponse(request),
        shouldForward: false,
        rateLimited: true,
      }
    }

    console.log(`RATE_LIMIT_WOULD_BLOCK: ${logDetails}`)
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
 * @param chainId The chain ID
 * @param originalRequest The original HTTP request
 * @param env The environment variables
 * @returns A BatchProcessingResult object with the processed requests and requests to forward
 */
export const processBatchRequests = async (
  requests: RpcRequest[],
  chainId: string,
  originalRequest: Request,
  env: Env
): Promise<BatchProcessingResult> => {
  // process all requests
  const processedRequests: ProcessedRequest[] = await Promise.all(
    requests.map((request) =>
      processSingleRequest(request, chainId, originalRequest, env)
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
