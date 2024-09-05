import { Toucan } from 'toucan-js'
import { getSubgraphUrl } from './networks'
import { Env, GraphQLRequest } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      request,
    })

    const url = new URL(request.url)
    const matched = url.pathname.match(/\/([0-9]+)/)
    if (!matched || !matched[1]) {
      return new Response('Bad Request, missing chain id', { status: 400 })
    }
    const networkId = matched[1]

    // Validate the network by retrieving the corresponding subgraph ID
    const subgraphUrl = getSubgraphUrl(networkId, env)
    if (!subgraphUrl) {
      return new Response(`Unsupported network ID: ${networkId}`, {
        status: 400,
      })
    }

    // Ensure that only POST requests are allowed for this endpoint
    if (request.method !== 'POST') {
      // Check if the request method is not POST
      return new Response('Method Not Allowed', { status: 405 }) // 405 Method Not Allowed
    }

    try {
      // Parse the incoming request body to extract the GraphQL query and variables
      const { query, variables }: GraphQLRequest = await request.json()

      // Validate that the query is provided in the request
      if (!query) {
        // If the query is missing
        return new Response('Bad Request: query is required', { status: 400 }) // 400 Bad Request
      }

      // Forward the request with the constructed URL
      const graphResponse = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      })

      // Process the response
      // Get the response data as text
      const responseData = await graphResponse.text()
      // Create a new Headers object from the response headers
      const responseHeaders = new Headers(graphResponse.headers)
      // Allow CORS for all origins
      responseHeaders.set('Access-Control-Allow-Origin', '*')

      // Return the response data along with the status and headers
      return new Response(responseData, {
        status: graphResponse.status,
        headers: responseHeaders,
      })
    } catch (error) {
      // Catch any errors that occur during processing
      sentry.captureException(error)
      console.error('Error processing request:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
}
