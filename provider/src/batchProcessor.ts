import { Env, ProcessingResult, RpcRequest, ProcessedRequest } from './types'
import {
  createProviderForwardingErrorResponse,
  createProcessingErrorResponse,
} from './errorHandlers'
import { processBatchRequests } from './requestProcessor'
import { forwardRequestsToProvider } from './providerClient'
import { storeResponseInCache } from './cache'

/**
 * Combine the locally processed responses with the responses from the provider
 *
 * @param processedRequests The array of processed requests
 * @param providerResponses The responses from the provider (if any)
 * @param chainId The chain ID
 * @param env The environment variables
 * @returns An array of combined responses in the same order as the original batch
 */
export const combineResponses = (
  processedRequests: ProcessedRequest[],
  providerResponses: any[] | null,
  chainId: string,
  env: any
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

    // If provider response is found and the request is marked as cacheable, store it
    if (providerResponse && processed.shouldCache) {
      storeResponseInCache(
        processed.request,
        chainId,
        providerResponse,
        env
      ).catch((error: Error) => {
        console.error('Error caching response:', error)
      })
    }

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
 * Process and forward requests as needed
 * This function handles the complete processing flow, including forwarding requests and combining responses
 *
 * @param body The original request body (single request or batch)
 * @param chainId The chain ID
 * @param originalRequest The original HTTP request
 * @param env The environment variables
 * @returns A ProcessingResult containing the responses and any error information
 */
export const processAndForwardRequests = async (
  body: RpcRequest | RpcRequest[],
  chainId: string,
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
      chainId,
      originalRequest,
      env
    )

    // If all requests can be handled locally, return the combined responses
    if (batchResult.requestsToForward.length === 0) {
      return {
        responses: batchResult.processedRequests.map((pr) => pr.response),
        isBatchRequest,
      }
    }

    // Otherwise, we need to forward some requests to the provider
    try {
      // Forward requests to the provider
      const forwardingResult = await forwardRequestsToProvider(
        batchResult.requestsToForward,
        chainId,
        env
      )

      // Handle error if present
      if (forwardingResult.error) {
        // Create an error response
        const requestId = isBatchRequest
          ? batchResult.requestsToForward[0]?.id || 42
          : batchResult.requestsToForward[0]?.id || 42

        const errorResponse = createProviderForwardingErrorResponse(
          requestId,
          forwardingResult.error.originalError
        )

        // If this was a batch request, combine with local responses
        if (isBatchRequest) {
          const combinedResponses = combineResponses(
            batchResult.processedRequests,
            [errorResponse],
            chainId,
            env
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
          providerResponses,
          chainId,
          env
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

      const errorResponse = createProcessingErrorResponse(requestId, error)

      // If this was a batch request, combine with local responses
      if (isBatchRequest) {
        const combinedResponses = combineResponses(
          batchResult.processedRequests,
          [errorResponse],
          chainId,
          env
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

    const errorResponse = createProcessingErrorResponse(42, error)

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
