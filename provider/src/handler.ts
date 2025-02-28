import supportedNetworks from './supportedNetworks'
import { Env } from './types'
import {
  checkRateLimit,
  getContractAddress,
  isUnlockContract,
  getClientIP,
} from './rateLimit'

interface RpcRequest {
  id: number
  jsonrpc: string
  method: string
  params: string[]
}

// Default cache TTL in seconds (1 hour)
const DEFAULT_CACHE_TTL = 60 * 60

// Get the cache TTL from environment or use default
const getCacheTTL = (env: Env): number => {
  if (env.CACHE_DURATION_SECONDS) {
    const duration = parseInt(env.CACHE_DURATION_SECONDS, 10)
    // Validate the parsed value is a positive number
    if (!isNaN(duration) && duration > 0) {
      return duration
    }
    console.warn(
      `Invalid CACHE_DURATION_SECONDS value: ${env.CACHE_DURATION_SECONDS}, using default: ${DEFAULT_CACHE_TTL}`
    )
  }
  return DEFAULT_CACHE_TTL
}

// Methods that should be cached
const CACHEABLE_METHODS = [
  'eth_call', // utilised by ENS resolver and other name resolution services
]

// Check if the request is for name resolution (ENS or Base name)
const isNameResolutionRequest = (body: RpcRequest): boolean => {
  if (body.method !== 'eth_call') return false

  // ENS and BaseName resolution typically use eth_call with specific contract data
  // This checks for common ENS and BaseName resolution patterns in the call data
  const callParams = body.params[0] as { data?: string } | undefined
  const callData = callParams?.data?.toLowerCase() || ''

  // ENS resolver methods
  const ensPatterns = [
    '0x3b3b57de', // addr(bytes32)
    '0xf1cb7e06', // addr(bytes32,uint256)
    '0x691f3431', // name(bytes32)
    '0x2203ab56', // text(bytes32,string)
  ]

  // Base Name resolver patterns (L2 resolver methods)
  const baseNamePatterns = [
    '0x691f3431', // name(bytes32)
  ]

  return (
    ensPatterns.some((pattern) => callData.startsWith(pattern)) ||
    baseNamePatterns.some((pattern) => callData.startsWith(pattern))
  )
}

// Create a cache key from a request
const createCacheKey = (networkId: string, body: RpcRequest): string => {
  // For name resolution, we want to cache based on the method and params
  // Using https://cache/ as a base URL to make it valid for Cloudflare's cache API
  // This is just a convention - not an actual domain - to create a properly formatted
  // cache key that satisfies the Request object format requirements
  return `https://cache/${networkId}/${body.method}/${encodeURIComponent(JSON.stringify(body.params))}`
}

const handler = async (request: Request, env: Env): Promise<Response> => {
  try {
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

    let body: RpcRequest
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

    // Handling chainId locally
    if (
      body?.method?.toLocaleLowerCase().trim() ===
      'eth_chainId'.toLocaleLowerCase()
    ) {
      return Response.json(
        {
          id: body.id || 42,
          jsonrpc: '2.0',
          result: `0x${parseInt(networkId).toString(16)}`,
        },
        {
          headers,
        }
      )
    }

    // Extract contract address if applicable
    const contractAddress = getContractAddress(body.method, body.params)

    // Check if this is an Unlock contract (skip rate limiting if true)
    let isUnlock = false
    try {
      if (contractAddress) {
        isUnlock = await isUnlockContract(contractAddress, networkId, env)
      }
    } catch (error) {
      console.error('Error checking unlock contract:', error)
      // If we can't verify if it's an Unlock contract, default to not being one
      isUnlock = false
    }

    // Only apply rate limiting if not an Unlock contract
    if (!isUnlock) {
      try {
        const isRateLimitAllowed = await checkRateLimit(
          request,
          body.method,
          contractAddress,
          env
        )

        if (!isRateLimitAllowed) {
          // TEMPORARY: Log but don't block rate-limited requests for monitoring purposes
          // After 10+ days, review logs and enable actual blocking
          console.log(
            `RATE_LIMIT_WOULD_BLOCK: IP=${getClientIP(request)}, Method=${body.method}, Contract=${contractAddress || 'none'}, ID=${body.id || 'none'}`
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
      } catch (error) {
        console.error('Error checking rate limits:', error)
        // On error, allow the request to proceed rather than blocking legitimate traffic
      }
    }

    // Check if this is a cacheable request
    const isCacheable =
      CACHEABLE_METHODS.includes(body.method) && isNameResolutionRequest(body)

    // If cacheable, try to get the result from the cache
    if (isCacheable) {
      try {
        const cacheKey = createCacheKey(networkId, body)

        // Try to get the cached response
        const cache = caches.default
        const cachedResponse = await cache.match(new Request(cacheKey))

        if (cachedResponse) {
          console.log(`Cache hit for ${cacheKey}`)
          return cachedResponse
        }
        console.log(`Cache miss for ${cacheKey}`)
      } catch (error) {
        console.error('Error accessing cache:', error)
        // On cache error, proceed to make the actual request
      }
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
        return Response.json(
          {
            id: body.id || 42,
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

      // If this is a cacheable request, store the response in the cache
      if (isCacheable) {
        try {
          const cacheKey = createCacheKey(networkId, body)
          const cache = caches.default

          // Clone the response before modifying it for cache storage
          const responseToCache = new Response(JSON.stringify(json), {
            headers: {
              ...headers,
              'Cache-Control': `public, max-age=${cacheTTL}`,
            },
          })

          // Store the response in the cache with the specified TTL
          await cache.put(new Request(cacheKey), responseToCache)
          console.log(
            `Cached response for ${cacheKey} with TTL: ${cacheTTL} seconds`
          )
        } catch (error) {
          console.error('Error caching response:', error)
          // Continue even if caching fails
        }
      }

      return jsonResponse
    } catch (error) {
      console.error('Error making RPC request:', error)
      return Response.json(
        {
          id: body.id || 42,
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
