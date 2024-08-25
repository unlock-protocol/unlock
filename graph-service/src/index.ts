import { getSubgraphId } from './networks'
import { Env, GraphQLRequest } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    // Remove the leading '/' to get the network name
    const network = url.pathname.slice(1)

    // Validate the network by retrieving the corresponding subgraph ID
    const subgraphId = getSubgraphId(network, env)
    if (!subgraphId) {
      return new Response(`Unsupported network: ${network}`, { status: 400 })
    }
    const graphUrl = `${env.BASE_URL}/${subgraphId}/version/latest`

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
      const graphResponse = await fetch(graphUrl, {
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
      console.error('Error processing request:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
}
