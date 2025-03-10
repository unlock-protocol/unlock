import { Env } from './types'
import { RpcRequest, getClientIP } from './utils'
import { processAndForwardRequests } from './batchProcessor'

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

    // Check if the network is supported by trying to get the provider URL
    const providerKey = `${networkId.toUpperCase()}_PROVIDER`
    if (!env[providerKey as keyof Env]) {
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

    // Process and forward requests as needed
    const result = await processAndForwardRequests(
      body,
      networkId,
      request,
      env
    )

    // Handle any errors
    if (result.error) {
      return Response.json(
        result.isBatchRequest ? result.responses : result.responses[0],
        {
          status: result.error.status || 500,
          headers,
        }
      )
    }

    // Return the responses
    return Response.json(
      result.isBatchRequest ? result.responses : result.responses[0],
      { headers }
    )
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
