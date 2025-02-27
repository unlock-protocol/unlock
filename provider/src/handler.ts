import supportedNetworks from './supportedNetworks'
import { Env } from './types'

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
  return `${networkId}:${body.method}:${JSON.stringify(body.params)}`
}

const handler = async (request: Request, env: Env): Promise<Response> => {
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
  }

  if (pathname === '/data' && queryURL) {
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

  const body: RpcRequest = await request.json()
  const bodyAsString = JSON.stringify(body)
  console.log(bodyAsString)

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

  // Check if this is a cacheable request
  const isCacheable =
    CACHEABLE_METHODS.includes(body.method) && isNameResolutionRequest(body)

  // If cacheable, try to get the result from the cache
  if (isCacheable) {
    const cacheKey = createCacheKey(networkId, body)

    // Try to get the cached response
    const cache = caches.default
    const cachedResponse = await cache.match(new Request(cacheKey))

    if (cachedResponse) {
      console.log(`Cache hit for ${cacheKey}`)
      return cachedResponse
    }
    console.log(`Cache miss for ${cacheKey}`)
  }

  // Make JSON RPC request
  const response = await fetch(supportedNetwork, {
    method: 'POST',
    body: bodyAsString,
    headers: new Headers({
      Accept: '*/*',
      Origin: 'https://rpc.unlock-protocol.com/', // required to add this to allowlists
    }),
  })

  const json = await response.json()

  // Create the response object
  const jsonResponse = Response.json(json, {
    headers,
  })

  // If this is a cacheable request, store the response in the cache
  if (isCacheable) {
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
    console.log(`Cached response for ${cacheKey} with TTL: ${cacheTTL} seconds`)
  }

  return jsonResponse
}

export default handler
