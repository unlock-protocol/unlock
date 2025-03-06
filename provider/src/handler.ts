import supportedNetworks from './supportedNetworks'
import { Env } from './types'
import { shouldRateLimit } from './rateLimit'
import { getRPCResponseFromCache, storeRPCResponseInCache } from './cache'
import { RpcRequest, getCacheTTL, getClientIP } from './utils'

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
    if (origin === 'chrome-extension://mnkbccinkbalkmmnmbcicdobcmgggmfc') {
      return Response.json(
        { message: '' },
        {
          status: 400,
        }
      )
    }

    // Get the cache TTL from environment or use default
    const cacheTTL = getCacheTTL(env)

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

    const bodyAsString = JSON.stringify(body)

    // Handle both single requests and batch requests
    const requests = Array.isArray(body) ? body : [body]

    // Check if any request in the batch is for chainId
    const chainIdRequest = requests.find((req) => {
      if (!req || typeof req !== 'object' || !req.method) return false
      return req.method.toLowerCase().trim() === 'eth_chainid'
    })

    if (chainIdRequest && !Array.isArray(body)) {
      return Response.json(
        {
          id: chainIdRequest.id || 42,
          jsonrpc: '2.0',
          result: `0x${parseInt(networkId).toString(16)}`,
        },
        {
          headers,
        }
      )
    }

    // handle rate limiting
    const rateLimit = await shouldRateLimit(request, env, body, networkId)
    if (rateLimit) {
      // TEMPORARY: Log but don't block rate-limited requests for monitoring purposes
      // After 10+ days, review logs and enable actual blocking
      console.log(
        `RATE_LIMIT_WOULD_BLOCK: IP=${getClientIP(request)}, networkId=${networkId}, Body=${bodyAsString}`
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
    }

    // Try to get the cached response, if applicable
    const cachedResponse = await getRPCResponseFromCache(
      networkId,
      body,
      request
    )
    if (cachedResponse) {
      return cachedResponse
    }

    // Make JSON RPC request
    try {
      const response = await fetch(supportedNetwork, {
        method: 'POST',
        body: bodyAsString,
        headers: new Headers({
          Accept: '*/*',
          Origin: 'https://rpc.unlock-protocol.com/', // required to add this to allowlists
        }),
      })

      let json
      try {
        json = await response.json()
      } catch (error) {
        console.error('Error parsing JSON response:', error)

        // Get ID from the first request or use default
        let responseId = 42
        if (Array.isArray(body)) {
          responseId =
            body.length > 0 &&
            body[0] &&
            typeof body[0] === 'object' &&
            'id' in body[0]
              ? body[0].id
              : 42
        } else if (body && typeof body === 'object' && 'id' in body) {
          responseId = body.id
        }

        return Response.json(
          {
            id: responseId,
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal JSON-RPC error',
              data: 'Failed to parse response from provider',
            },
          },
          {
            status: 500,
            headers,
          }
        )
      }

      // Create the response object
      const jsonResponse = Response.json(json, {
        headers,
      })

      // Store the response in the cache if applicable
      await storeRPCResponseInCache(networkId, body, json, env)

      return jsonResponse
    } catch (error) {
      console.error('Error making RPC request:', error)

      // Get ID from the first request or use default
      let responseId = 42
      if (Array.isArray(body)) {
        responseId =
          body.length > 0 &&
          body[0] &&
          typeof body[0] === 'object' &&
          'id' in body[0]
            ? body[0].id
            : 42
      } else if (body && typeof body === 'object' && 'id' in body) {
        responseId = body.id
      }

      return Response.json(
        {
          id: responseId,
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal JSON-RPC error',
            data: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        {
          status: 500,
          headers,
        }
      )
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
