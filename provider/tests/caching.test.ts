import { describe, test, expect, vi, beforeEach } from 'vitest'
import handler from '../src/handler'
import { Env } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import {
  createMockEnv,
  createEthCallRequest,
  createMockRequest,
  setupCacheMocks,
  setupCommonBeforeEach,
} from './__fixtures__/testUtils'

describe('Caching Functionality', () => {
  let mockEnv: Partial<Env>

  beforeEach(() => {
    setupCommonBeforeEach()

    vi.spyOn(rateLimit, 'getClientIP').mockReturnValue('127.0.0.1')

    // Setup cache mocks
    setupCacheMocks()

    // Create mock environment
    mockEnv = createMockEnv()
  })

  test('Cacheable methods should be cached', async () => {
    // Create a request for eth_call (should be cached)
    const mockRequest = createEthCallRequest()

    // Mock cache miss
    // @ts-ignore - Using mocked function
    global.caches.default.match.mockResolvedValueOnce(null)

    // Mock successful fetch response
    const mockResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
      { status: 200 }
    )
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    await handler(mockRequest, mockEnv as Env)

    // Verify that the cache was checked first
    // @ts-ignore - Using mocked function
    expect(global.caches.default.match).toHaveBeenCalledTimes(1)

    // Verify that the result was cached
    // @ts-ignore - Using mocked function
    expect(global.caches.default.put).toHaveBeenCalledTimes(1)
  })

  test('Non-cacheable methods should not be cached', async () => {
    // Create a request for eth_blockNumber (should not be cached)
    const mockRequest = createMockRequest('1', 'eth_blockNumber', [])

    // Mock successful fetch response
    const mockResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
      { status: 200 }
    )
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    await handler(mockRequest, mockEnv as Env)

    // Verify that the cache was not used
    // @ts-ignore - Using mocked function
    expect(global.caches.default.match).not.toHaveBeenCalled()

    // @ts-ignore - Using mocked function
    expect(global.caches.default.put).not.toHaveBeenCalled()
  })

  test('Cached responses should be returned directly', async () => {
    // Create a request for eth_call (should be cached)
    const mockRequest = createEthCallRequest()

    // Mock cache hit
    const cachedResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xcached' }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'max-age=3600',
        },
      }
    )

    // @ts-ignore - Using mocked function
    global.caches.default.match.mockResolvedValueOnce(cachedResponse)

    const response = await handler(mockRequest, mockEnv as Env)
    const responseBody = (await response.json()) as {
      jsonrpc: string
      id: number
      result: string
    }

    // Verify that the cached response was returned
    expect(responseBody.result).toBe('0xcached')

    // Verify that fetch was not called (as we got a cache hit)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
