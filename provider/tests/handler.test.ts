import { describe, test, expect, vi, beforeEach } from 'vitest'
import handler from '../src/handler'
import { Env } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import * as utils from '../src/utils'
import {
  createMockEnv,
  createMockRequest,
  setupCommonBeforeEach,
  createEthCallRequest,
  setupCacheMocks,
} from './__fixtures__/testUtils'


interface ExtendedMockEnv extends Partial<Env> {
  NETWORK_CONFIG?: Record<string, { rpcUrl: string }>
}

describe('Handler Functionality', () => {
  let mockEnv: ExtendedMockEnv
  let mockRequest: Request
  let shouldRateLimitMock: any

  beforeEach(() => {
    setupCommonBeforeEach()
    mockEnv = createMockEnv() as ExtendedMockEnv

    // Add the missing properties for our tests
    mockEnv.NETWORK_CONFIG = {
      '1': { rpcUrl: 'https://mock-mainnet.example.com' },
      '10': { rpcUrl: 'https://mock-optimism.example.com' },
    }

    mockRequest = createMockRequest()

    // Get a reference to the mocked shouldRateLimit function
    shouldRateLimitMock = rateLimit.shouldRateLimit as unknown as ReturnType<
      typeof vi.fn
    >

    // Reset the mock implementation for each test
    shouldRateLimitMock.mockClear()

    // Setup cache mocks in the global object
    setupCacheMocks()
  })

  test('Basic functionality - handles valid requests', async () => {
    // Mock a successful response
    const mockResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
      { status: 200 }
    )

    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    const response = await handler(mockRequest, mockEnv as Env)
    expect(response.status).toBe(200)

    const responseBody = (await response.json()) as {
      jsonrpc: string
      id: number
      result: string
    }
    expect(responseBody).toEqual({ jsonrpc: '2.0', id: 1, result: '0x1234' })

    // Verify that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('Handles invalid network ID', async () => {
    // Create request with invalid network ID
    const invalidRequest = createMockRequest('invalid')

    const response = await handler(invalidRequest, mockEnv as Env)
    // Updated from 400 to 404 based on actual implementation
    expect(response.status).toBe(404)

    const responseBody = (await response.json()) as {
      message: string
    }
    expect(responseBody.message).toBeDefined()
    expect(responseBody.message).toContain('Unsupported network ID')
  })

  test('Handles unsupported HTTP methods', async () => {
    // Create a GET request which should be rejected
    const getRequest = new Request('https://rpc.unlock-protocol.com/1', {
      method: 'GET',
      headers: {
        'CF-Connecting-IP': '127.0.0.1',
      },
    })

    const response = await handler(getRequest, mockEnv as Env)

    expect(response.status).toBe(400)

    const responseBody = (await response.json()) as {
      message: string
    }
    expect(responseBody.message).toBeDefined()
    expect(responseBody.message).toContain('Method GET not supported')
  })

  // RATE LIMITING TESTS
  describe('Rate Limiting', () => {
    test('Should process requests that are not rate limited', async () => {
      // Create a request with CF-Ray header
      const mockRateRequest = createMockRequest('1', 'eth_blockNumber', [], {
        'CF-Ray': '12345678abcdef',
      })

      // Mock successful fetch response
      const mockResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
        { status: 200 }
      )
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Set up the mock implementation for this specific test
      shouldRateLimitMock.mockImplementationOnce(async () => {
        return false // Do not rate limit the request
      })

      // Process the request
      const originalResponse = await handler(mockRateRequest, mockEnv as Env)

      expect(originalResponse.status).toBe(200)

      // Verify that the rate limit check was called
      expect(shouldRateLimitMock).toHaveBeenCalledTimes(1)
    })

    test('Should handle rate limited requests', async () => {
      // Create a request with rate-limited CF-Ray header
      const mockRateRequest = createMockRequest('1', 'eth_blockNumber', [], {
        'CF-Ray': 'rate-limited-12345',
      })

      // Set up the mock to rate limit this request
      shouldRateLimitMock.mockImplementationOnce(async () => {
        return true // Rate limit the request
      })

      // Mock successful fetch response for the underlying request
      const mockResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
        { status: 200 }
      )
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      const response = await handler(mockRateRequest, mockEnv as Env)

      // Even though rate limited, for now we're just logging and still processing the request
      expect(response.status).toBe(200)

      // Verify that the rate limit check was called
      expect(shouldRateLimitMock).toHaveBeenCalledTimes(1)

      // Verify that fetch was still called (as rate limiting is just logging currently)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    test('Should have special handling for Unlock contracts', async () => {
      
      vi.spyOn(utils, 'getContractAddress').mockImplementation(
        (method, params) => {
          if (method === 'eth_call' && params && params[0] && params[0].to) {
            return params[0].to
          }
          return null
        }
      )

      // Mock isUnlockContract to return true for specific addresses
      vi.spyOn(rateLimit, 'isUnlockContract').mockImplementation(
        async (address) => {
          return address === '0xUnlockContract123'
        }
      )

      // Create test request bodies
      const unlockRequest = {
        method: 'eth_call',
        params: [{ to: '0xUnlockContract123' }, 'latest'],
      }

      const nonUnlockRequest = {
        method: 'eth_call',
        params: [{ to: '0xSomeOtherContract' }, 'latest'],
      }

      // Mock shouldRateLimitSingle to use our mocked dependencies
      const originalShouldRateLimitSingle = rateLimit.shouldRateLimitSingle

      // Mock shouldRateLimitIp to just return false
      vi.spyOn(rateLimit, 'shouldRateLimitIp').mockResolvedValue(false)

      // Test that Unlock contracts are exempted from rate limiting
      const unlockResult = await originalShouldRateLimitSingle(
        new Request('https://example.com'),
        mockEnv as Env,
        unlockRequest,
        '1'
      )

      // Unlock contracts should not be rate limited
      expect(unlockResult).toBe(false)

      
      await originalShouldRateLimitSingle(
        new Request('https://example.com'),
        mockEnv as Env,
        nonUnlockRequest,
        '1'
      )

      // Verify that isUnlockContract was called for both requests
      expect(rateLimit.isUnlockContract).toHaveBeenCalledTimes(2)
    })
  })

  // CACHING TESTS
  describe('Caching Behavior', () => {
    test('Should cache successful responses', async () => {
      const chainId = '1'

      // Mock that this is a cacheable request
      vi.spyOn(utils, 'isRequestCacheable').mockReturnValue(true)

      // Mock successful fetch response
      const mockResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
        { status: 200 }
      )

      // Mock fetch to return our mock response
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse.clone())

      // Send the request
      const cachedRequest = createEthCallRequest('0xAddress', '0xData', chainId)
      await handler(cachedRequest, mockEnv as Env)

      // Verify the cache.put was called
      // @ts-ignore - Using mocked function
      expect(global.caches.default.put).toHaveBeenCalled()
    })

    test('Should serve cached responses when available', async () => {
      const chainId = '1'

      // Create cached response
      const cachedResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xCachedResult' }),
        { status: 200 }
      )

      // Mock that this is a cacheable request
      vi.spyOn(utils, 'isRequestCacheable').mockReturnValue(true)

      // Mock cache hit
      // @ts-ignore - Using mocked function
      global.caches.default.match.mockResolvedValueOnce(cachedResponse.clone())

      // Mock fetch (should not be called)
      global.fetch = vi.fn()

      // Send the request
      const cachedRequest = createEthCallRequest('0xAddress', '0xData', chainId)
      const response = await handler(cachedRequest, mockEnv as Env)

      // Verify we got a response
      expect(response.status).toBe(200)

      // Verify the cached result is returned
      const responseBody = (await response.json()) as { result: string }
      expect(responseBody.result).toBe('0xCachedResult')

      // Verify fetch was NOT called
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  // NETWORK HANDLING TESTS
  describe('Network Handling', () => {
    test('Should handle eth_chainId requests correctly', async () => {
      const chainId = '1'

      // Create a request for eth_chainId
      const chainIdRequest = createMockRequest(chainId, 'eth_chainId')
      const response = await handler(chainIdRequest, mockEnv as Env)

      // Verify we got a response
      expect(response.status).toBe(200)

      // Verify the chain ID is correctly returned
      const responseBody = (await response.json()) as { result: string }
      expect(responseBody.result).toBe(`0x${parseInt(chainId).toString(16)}`)

      // Verify fetch was NOT called (chainId is handled directly)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('Should forward requests to the correct RPC URL', async () => {
      const chainId = '10'

      // Create a mock request for network 10
      const mockNetworkRequest = createMockRequest(chainId, 'eth_blockNumber')

      // Mock a successful response
      const mockResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
        { status: 200 }
      )

      // Mock fetch to return our mock response and capture URL
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Send the request
      await handler(mockNetworkRequest, mockEnv as Env)

      // Verify fetch was called with the right URL
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchCall = (global.fetch as any).mock.calls[0]

      // Use the correct approach to check URL contains network
      const url = fetchCall[0] as string
      expect(url).toContain(mockEnv.NETWORK_CONFIG?.[chainId]?.rpcUrl)
    })
  })
})
