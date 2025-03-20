/**
 * Error handling utilities for JSON-RPC responses
 */

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
 * Creates a standard error response for provider forwarding failures
 *
 * @param requestId The ID of the request that failed
 * @param error The original error object
 * @returns A formatted error response
 */
export const createProviderForwardingErrorResponse = (
  requestId: number | string,
  error: any
): any => {
  return createErrorResponse(
    requestId,
    -32603,
    'Internal JSON-RPC error',
    error instanceof Error
      ? error.message
      : 'Failed to forward requests to provider'
  )
}

/**
 * Creates a standard error response for unexpected processing errors
 *
 * @param requestId The ID of the request that failed
 * @param error The original error object
 * @returns A formatted error response
 */
export const createProcessingErrorResponse = (
  requestId: number | string,
  error: any
): any => {
  return createErrorResponse(
    requestId,
    -32603,
    'Internal JSON-RPC error',
    error instanceof Error ? error.message : 'Unknown error'
  )
}
