import {
  BatchProcessingResult,
  Env,
  ForwardingResult,
  ProcessedRequest,
  ProcessingResult,
  RpcRequest,
} from './types'
import { getClientIP } from './utils'
import { shouldRateLimit } from './rateLimit'
import supportedNetworks from './supportedNetworks'

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
 * Forwards requests to the provider
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
    // Determine if this is a single request or a batch
    const isBatchRequest = requestsToForward.length > 1
    const forwardBody = isBatchRequest
      ? requestsToForward
      : requestsToForward[0]

    // Get the appropriate provider URL for the network
    const supportedNetwork = supportedNetworks(env, networkId)

    // Forward the request to the provider
    const response = await fetch(supportedNetwork!, {
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

    // Return the responses as an array
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

/**
 * Process and forward requests as needed
 * This function handles the complete processing flow, including forwarding requests and combining responses
 *
 * @param body The original request body (single request or batch)
 * @param networkId The network ID
 * @param originalRequest The original HTTP request
 * @param env The environment variables
 * @returns A ProcessingResult containing the responses and any error information
 */
export const processAndForwardRequests = async (
  body: RpcRequest | RpcRequest[],
  networkId: string,
  originalRequest: Request,
  env: Env
): Promise<ProcessingResult> => {
  try {
    // Convert single requests to batch format for uniform processing
    const requests = Array.isArray(body) ? body : [body]
    const isBatchRequest = Array.isArray(body)

    // Process the batch of requests
    const batchResult = await processBatchRequests(
      requests,
      networkId,
      originalRequest,
      env
    )

    // If all requests can be handled locally, return the combined responses
    if (batchResult.requestsToForward.length === 0) {
      const responses = batchResult.processedRequests.map((pr) => pr.response)
      return {
        responses: responses,
        isBatchRequest,
      }
    }

    // Otherwise, we need to forward some requests to the provider
    try {
      // Forward requests to the provider
      const forwardingResult = await forwardRequestsToProvider(
        batchResult.requestsToForward,
        networkId,
        env
      )

      // Handle error if present
      if (forwardingResult.error) {
        // Create an error response
        const requestId = isBatchRequest
          ? batchResult.requestsToForward[0]?.id || 42
          : batchResult.requestsToForward[0]?.id || 42

        const errorResponse = createErrorResponse(
          requestId,
          -32603,
          'Internal JSON-RPC error',
          forwardingResult.error.message
        )

        // If this was a batch request, combine with local responses
        if (isBatchRequest) {
          const combinedResponses = combineResponses(
            batchResult.processedRequests,
            [errorResponse]
          )

          return {
            responses: combinedResponses,
            isBatchRequest,
            error: {
              message: forwardingResult.error.message,
              originalError: forwardingResult.error.originalError,
              status: 500,
            },
          }
        }

        return {
          responses: [errorResponse],
          isBatchRequest,
          error: {
            message: forwardingResult.error.message,
            originalError: forwardingResult.error.originalError,
            status: 500,
          },
        }
      }

      // Get the provider responses
      const providerResponses = forwardingResult.responses || []

      // For batch requests, combine the local and provider responses
      if (isBatchRequest) {
        const combinedResponses = combineResponses(
          batchResult.processedRequests,
          providerResponses
        )

        return {
          responses: combinedResponses,
          isBatchRequest,
        }
      }

      // For single requests, return the provider response directly
      return {
        responses: providerResponses,
        isBatchRequest,
      }
    } catch (error) {
      console.error('Unexpected error in RPC request handling:', error)

      // Create an error response
      const requestId = isBatchRequest
        ? batchResult.requestsToForward[0]?.id || 42
        : batchResult.requestsToForward[0]?.id || 42

      const errorResponse = createErrorResponse(
        requestId,
        -32603,
        'Internal JSON-RPC error',
        error instanceof Error ? error.message : 'Unknown error'
      )

      // If this was a batch request, combine with local responses
      if (isBatchRequest) {
        const combinedResponses = combineResponses(
          batchResult.processedRequests,
          [errorResponse]
        )

        return {
          responses: combinedResponses,
          isBatchRequest,
          error: {
            message: 'Unexpected error in RPC request handling',
            originalError: error,
            status: 500,
          },
        }
      }

      return {
        responses: [errorResponse],
        isBatchRequest,
        error: {
          message: 'Unexpected error in RPC request handling',
          originalError: error,
          status: 500,
        },
      }
    }
  } catch (error) {
    console.error('Unexpected error in processing requests:', error)

    const errorResponse = {
      id: 42,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal JSON-RPC error',
        data: error instanceof Error ? error.message : 'Unknown error',
      },
    }

    return {
      responses: [errorResponse],
      isBatchRequest: false,
      error: {
        message: 'Unexpected error in processing requests',
        originalError: error,
        status: 500,
      },
    }
  }
}
