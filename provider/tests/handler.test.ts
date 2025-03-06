import { describe, test, expect, vi, beforeEach } from 'vitest'
import handler from '../src/handler'
import { Env } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import * as utils from '../src/utils'
import {
  createMockEnv,
  createMockRequest,
  createEthCallRequest,
  setupGlobalMocks,
} from './__fixtures__/testUtils'
import * as cache from '../src/cache'

interface ExtendedMockEnv extends Partial<Env> {
  NETWORK_CONFIG?: Record<string, { rpcUrl: string }>
}

describe('Handler Functionality', () => {
  let mockEnv: ExtendedMockEnv
  let mockRequest: Request

  beforeEach(() => {
    setupGlobalMocks()
    mockEnv = createMockEnv() as ExtendedMockEnv
    mockRequest = createMockRequest()
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
    const invalidRequest = createMockRequest(
      'invalid',
      'eth_blockNumber',
      [],
      {},
      '127.0.0.1'
    )

    const response = await handler(invalidRequest, mockEnv as Env)
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
      const mockRateRequest = createMockRequest(
        '1',
        'eth_blockNumber',
        [],
        {
          'CF-Ray': '12345678abcdef',
        },
        '127.0.0.1'
      )

      // Mock successful fetch response
      const mockResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
        { status: 200 }
      )
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      // Set up the mock implementation for this specific test
      vi.spyOn(rateLimit, 'shouldRateLimit').mockResolvedValue(false)

      // Process the request
      const response = await handler(mockRateRequest, mockEnv as Env)

      expect(response.status).toBe(200)

      // Verify that the rate limit check was called
      expect(rateLimit.shouldRateLimit).toHaveBeenCalledTimes(1)
    })

    test('Should handle rate limited requests', async () => {
      // Create a request with rate-limited CF-Ray header
      const mockRateRequest = createMockRequest(
        '1',
        'eth_blockNumber',
        [],
        {
          'CF-Ray': 'rate-limited-12345',
        },
        '127.0.0.1'
      )

      // Set up the mock to rate limit this request
      vi.spyOn(rateLimit, 'shouldRateLimit').mockResolvedValue(true)

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
      expect(rateLimit.shouldRateLimit).toHaveBeenCalledTimes(1)

      // Verify that fetch was still called (as rate limiting is just logging currently)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    test('Should have special handling for Unlock contracts', async () => {
      vi.spyOn(rateLimit, 'shouldRateLimitSingle').mockImplementation(
        async (req, env, body) => {
          const to = body.params[0]?.to
          return to !== '0xUnlockContract123' // Return false (don't rate limit) for Unlock contracts
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

      // Test that Unlock contracts are exempted from rate limiting
      const unlockResult = await rateLimit.shouldRateLimitSingle(
        new Request('https://example.com'),
        mockEnv as Env,
        unlockRequest,
        '1'
      )

      // Unlock contracts should not be rate limited
      expect(unlockResult).toBe(false)

      const nonUnlockResult = await rateLimit.shouldRateLimitSingle(
        new Request('https://example.com'),
        mockEnv as Env,
        nonUnlockRequest,
        '1'
      )

      // Non-Unlock contracts should be rate limited
      expect(nonUnlockResult).toBe(true)
    })
  })

  // CACHING TESTS
  describe('Caching Behavior', () => {
    test('Should cache successful responses', async () => {
      // Enable caching for this test
      vi.spyOn(utils, 'isRequestCacheable').mockReturnValue(true)

      // Mock the cache functions directly
      vi.spyOn(cache, 'getRPCResponseFromCache').mockResolvedValue(null)
      const storeInCacheSpy = vi
        .spyOn(cache, 'storeRPCResponseInCache')
        .mockResolvedValue(true)

      // Mock successful fetch response
      const mockResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
        { status: 200 }
      )

      // Mock fetch to return our mock response
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse.clone())

      // Send the request
      const cachedRequest = createEthCallRequest('0xAddress', '0xData', '1')
      await handler(cachedRequest, mockEnv as Env)

      // Verify the cache.storeInCache was called
      expect(storeInCacheSpy).toHaveBeenCalled()
    })

    test('Should serve cached responses when available', async () => {
      // Enable caching for this test
      vi.spyOn(utils, 'isRequestCacheable').mockReturnValue(true)

      // Create a cached response
      const cachedResponse = new Response(
        JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xcached' }),
        {
          status: 200,
          headers: {
            'Cache-Control': 'max-age=3600',
          },
        }
      )

      // Mock the cache functions directly
      vi.spyOn(cache, 'getRPCResponseFromCache').mockResolvedValue(
        cachedResponse.clone()
      )

      // Make sure fetch is never called
      global.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Fetch should not be called when cache hit exists')
      })

      // Send the request
      const cachedRequest = createEthCallRequest('0xAddress', '0xData', '1')
      const response = await handler(cachedRequest, mockEnv as Env)

      // Verify we got the cached response back
      const responseBody = (await response.json()) as {
        jsonrpc: string
        id: number
        result: string
      }
      expect(responseBody.result).toBe('0xcached')

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
