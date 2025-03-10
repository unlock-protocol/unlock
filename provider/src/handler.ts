import supportedNetworks from './supportedNetworks'
import { Env } from './types'
import { storeRPCResponseInCache } from './cache'
import { RpcRequest, getClientIP } from './utils'
import {
  processBatchRequests,
  processChainIdRequest,
  combineResponses,
} from './batchProcessor'

const handler = async (request: Request, env: Env): Promise<Response> => {
  try {
    // Blocking arbitrum abuses
    const ipAddress = getClientIP(request)
    if (
      ['147.182.205.89', '176.9.154.118', '65.108.198.24'].indexOf(ipAddress) >=
      0
    ) {
      return Response.json(
        { message: '' },
        {
          status: 429,
        }
      )
    }

    // Blocking requests from the Chrome extension
    const origin = request.headers.get('origin')
    if (
      origin &&
      origin.match(/\b[a-zA-Z0-9_-]+-extension:\/\/[^ \n\r]+/) !== null
    ) {
      return Response.json(
        { message: '' },
        {
          status: 400,
        }
      )
    }

    // Handling CORS
    if (request.method === 'OPTIONS') {
      return new Response('', {
        headers: {
          'access-control-allow-methods': 'POST, GET, OPTIONS',
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '86400',
          'access-control-allow-origin': '*',
          vary: 'Origin',
          'access-control-allow-credentials': 'true',
        },
      })
    }

    const url = new URL(request.url)
    const { pathname } = url
    const queryURL = url.searchParams.get('url')

    const headers = {
      'access-control-allow-origin': '*',
    }

    if (pathname === '/throw') {
      throw new Error('Test Error')
    }

    if (pathname === '/resolve-redirect' && queryURL) {
      try {
        const endpoint = new URL(queryURL)
        const result = await fetch(endpoint.toString(), {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000), // 5 seconds timeout
        })
        return Response.json(
          { url: result.url },
          {
            status: 200,
            headers,
          }
        )
      } catch (error) {
        console.error('Error resolving redirect:', error)
        return Response.json(
          {
            message: `Error resolving redirect: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
          {
            status: 500,
            headers,
          }
        )
      }
    }

    if (pathname === '/data' && queryURL) {
      try {
        const endpoint = new URL(queryURL)
        // Proxy the request
        const response = await fetch(endpoint.toString(), {
          method: 'GET',
          body: request.body,
          headers: new Headers({
            Accept: '*/*',
            Origin: 'https://unlock-protocol.com/',
            'Content-type': 'application/json',
          }),
        })

        const json: { data?: string } = await response.json()

        if (!json?.data) {
          return Response.json(
            {
              message: 'No data input found in the result.',
            },
            {
              status: 400,
              headers,
            }
          )
        }

        return Response.json(json, {
          status: 200,
          headers,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        return Response.json(
          {
            message: `Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
          {
            status: 500,
            headers,
          }
        )
      }
    }

    const matched = pathname.match(/\/([0-9]*)/)
    // Missing network
    if (!pathname || pathname === '/' || !matched) {
      return Response.json(
        { message: 'Bad Request, missing chain id' },
        {
          status: 400,
          headers,
        }
      )
    }

    const [_, networkId] = matched

    const supportedNetwork = supportedNetworks(env, networkId)

    // Network not supported
    if (!supportedNetwork) {
      return Response.json(
        { message: `Unsupported network ID: ${networkId}` },
        {
          status: 404,
          headers,
        }
      )
    }

    // Reject requests that are not POST
    if (request.method !== 'POST') {
      return Response.json(
        { message: `Method ${request.method} not supported` },
        {
          status: 400,
          headers,
        }
      )
    }

    let body: RpcRequest | RpcRequest[]
    try {
      body = await request.json()
    } catch (error) {
      console.error('Error parsing JSON request:', error)
      return Response.json(
        { message: 'Invalid JSON in request body' },
        {
          status: 400,
          headers,
        }
      )
    }

    // Handle single request for chainId
    if (
      !Array.isArray(body) &&
      body.method?.toLowerCase().trim() === 'eth_chainid'
    ) {
      return Response.json(processChainIdRequest(body, networkId), { headers })
    }

    // Convert single requests to batch format for uniform processing
    const requests = Array.isArray(body) ? body : [body]
    const isBatchRequest = Array.isArray(body)

    // Process the batch of requests
    const batchResult = await processBatchRequests(
      requests,
      networkId,
      request,
      env
    )

    // If all requests are rate limited, log but don't block
    if (
      batchResult.allRateLimited &&
      batchResult.processedRequests.length > 0
    ) {
      // For monitoring purposes, log but don't block
      console.log(
        `RATE_LIMIT_WOULD_BLOCK: IP=${getClientIP(request)}, networkId=${networkId}, Body=${JSON.stringify(body)}`
      )

      // Original blocking code - commented out for monitoring period
      /*
      return Response.json(
        {
          id: body.id || 42,
          jsonrpc: '2.0',
          error: {
            code: -32005,
            message: 'Rate limit exceeded',
          },
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': '60', // Suggest retry after 60 seconds
          },
        }
      )
      */
      // Note: We continue processing as normal, as rate-limited requests are still forwarded
    }

    // If all requests can be handled locally, return the combined responses
    if (batchResult.requestsToForward.length === 0) {
      const responses = batchResult.processedRequests.map((pr) => pr.response)
      return Response.json(isBatchRequest ? responses : responses[0], {
        headers,
      })
    }

    // Otherwise, we need to forward some requests to the provider
    try {
      // Only forward the requests that couldn't be handled locally
      const forwardBody = isBatchRequest
        ? batchResult.requestsToForward
        : batchResult.requestsToForward[0]

      const response = await fetch(supportedNetwork, {
        method: 'POST',
        body: JSON.stringify(forwardBody),
        headers: new Headers({
          Accept: '*/*',
          Origin: 'https://rpc.unlock-protocol.com/',
          'Content-Type': 'application/json',
        }),
      })

      let providerResponse
      try {
        providerResponse = await response.json()
      } catch (error) {
        console.error('Error parsing JSON response:', error)

        // Create an error response
        const errorResponse = {
          id: isBatchRequest
            ? batchResult.requestsToForward[0]?.id || 42
            : batchResult.requestsToForward[0]?.id || 42,
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal JSON-RPC error',
            data: 'Failed to parse response from provider',
          },
        }

        // If this was a batch request, combine with local responses
        if (isBatchRequest) {
          const combinedResponses = combineResponses(
            batchResult.processedRequests,
            Array.isArray(providerResponse) ? providerResponse : [errorResponse]
          )

          return Response.json(combinedResponses, { headers })
        }

        return Response.json(errorResponse, {
          status: 500,
          headers,
        })
      }

      // Store the response in the cache if applicable
      await storeRPCResponseInCache(
        networkId,
        forwardBody,
        providerResponse,
        env
      )

      // If this was a single request that was forwarded, return the provider response directly
      if (!isBatchRequest) {
        return Response.json(providerResponse, { headers })
      }

      // For batch requests, combine the local and provider responses
      const providerResponses = Array.isArray(providerResponse)
        ? providerResponse
        : [providerResponse]

      const combinedResponses = combineResponses(
        batchResult.processedRequests,
        providerResponses
      )

      return Response.json(combinedResponses, { headers })
    } catch (error) {
      console.error('Error making RPC request:', error)

      // Create an error response
      const errorResponse = {
        id: isBatchRequest
          ? batchResult.requestsToForward[0]?.id || 42
          : batchResult.requestsToForward[0]?.id || 42,
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal JSON-RPC error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
      }

      // If this was a batch request, we need to combine with local responses
      if (isBatchRequest) {
        const combinedResponses = combineResponses(
          batchResult.processedRequests,
          [errorResponse]
        )

        return Response.json(combinedResponses, { headers })
      }

      return Response.json(errorResponse, {
        status: 500,
        headers,
      })
    }
  } catch (error) {
    // Catch all for any uncaught exceptions
    console.error('Unexpected error in handler:', error)
    return Response.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'access-control-allow-origin': '*',
        },
      }
    )
  }
}

export default handler
