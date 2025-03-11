import { Env, ProcessingResult, RpcRequest } from './types'
import {
  createProviderForwardingErrorResponse,
  createProcessingErrorResponse,
} from './errorHandlers'
import { processBatchRequests, combineResponses } from './requestProcessor'
import { forwardRequestsToProvider } from './providerClient'

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

        const errorResponse = createProviderForwardingErrorResponse(
          requestId,
          forwardingResult.error.originalError
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

      const errorResponse = createProcessingErrorResponse(requestId, error)

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
