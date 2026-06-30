import { getSubgraphUrl } from './networks'
import { Env, GraphQLRequest } from './types'
import networks from '@unlock-protocol/networks'

const getHostname = (value: string) => {
  try {
    return new URL(value).hostname
  } catch {
    return 'invalid-url'
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Define CORS headers to allow cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    // Parse the request URL to extract the network ID
    const url = new URL(request.url)
    const matched = url.pathname.match(/\/([0-9]+)/)
    if (!matched || !matched[1]) {
      return new Response('Bad Request, missing chain id', {
        status: 400,
        headers: corsHeaders,
      })
    }
    const networkId = matched[1]
    const networkConfig = networks[networkId]

    const graphId = networkConfig?.subgraph?.graphId

    if (request.method === 'GET' && graphId) {
      return new Response(JSON.stringify({ graphId }), {
        status: 307,
        headers: {
          location: `https://thegraph.com/explorer/subgraphs/${graphId}?view=Query`,
        },
      })
    }

    // Retrieve the subgraph URL based on the network ID
    const subgraphUrl = getSubgraphUrl(networkId, env)
    if (!subgraphUrl) {
      return new Response(`Unsupported network ID: ${networkId}`, {
        status: 400,
        headers: corsHeaders,
      })
    }

    // Ensure the request method is POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      })
    }

    // Parse the incoming JSON request body
    const { query, variables }: GraphQLRequest = await request.json()

    // Validate that a query is provided
    if (!query) {
      return new Response('Bad Request: query is required', {
        status: 400,
        headers: corsHeaders,
      })
    }

    try {
      // Forward the GraphQL request to the subgraph
      const graphResponse = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      })

      // Extract response data and headers
      const responseData = await graphResponse.text()
      const responseHeaders = new Headers(graphResponse.headers)

      // Append CORS headers to the response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value)
      })

      if (graphResponse.status !== 200) {
        console.log('Graph service upstream returned non-200', {
          status: graphResponse.status,
          statusText: graphResponse.statusText,
          networkId,
          subgraphHost: getHostname(subgraphUrl),
          responseBytes: responseData.length,
        })
      }

      // Return the response from the subgraph
      return new Response(responseData, {
        status: graphResponse.status,
        headers: responseHeaders,
      })
    } catch (error) {
      console.error('Error forwarding graph request:', error)
      return new Response('Internal Server Error', {
        status: 500,
        headers: corsHeaders,
      })
    }
  },
}
