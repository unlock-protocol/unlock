import { Env, ForwardingResult, RpcRequest } from './types'
import supportedNetworks from './supportedNetworks'

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
    // Get the appropriate provider URL for the network
    const supportedNetwork = supportedNetworks(env, networkId)

    // Forward the request to the provider
    const response = await fetch(supportedNetwork!, {
      method: 'POST',
      body: JSON.stringify(requestsToForward),
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
