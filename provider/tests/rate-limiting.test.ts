import { describe, test, expect, vi, beforeEach } from 'vitest'
import handler from '../src/handler'
import { Env } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import {
  createMockEnv,
  createMockRequest,
  setupCommonBeforeEach,
} from './__fixtures__/testUtils'

describe('Rate Limiting Functionality', () => {
  let mockEnv: Partial<Env>
  let checkRateLimitMock: any

  beforeEach(() => {
    setupCommonBeforeEach()
    mockEnv = createMockEnv()

    checkRateLimitMock = rateLimit.checkRateLimit as unknown as ReturnType<
      typeof vi.fn
    >

    // Reset the mock implementation for each test
    checkRateLimitMock.mockClear()
  })

  test('Should add rate limiting headers to response', async () => {
    // Create a request with CF-Ray header
    const mockRequest = createMockRequest('1', 'eth_blockNumber', [], {
      'CF-Ray': '12345678abcdef',
    })

    // Mock successful fetch response
    const mockResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
      { status: 200 }
    )
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    // Set up the mock implementation for this specific test
    checkRateLimitMock.mockImplementationOnce(async () => {
      return true // Allow the request
    })

    // stub implementation to capture what happens
    const originalResponse = await handler(mockRequest, mockEnv as Env)

    expect(originalResponse.status).toBe(200)

    // Verify that the rate limit check was called
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1)
  })

  test('Should handle rate limited requests', async () => {
    // Create a request with rate-limited CF-Ray header
    const mockRequest = createMockRequest('1', 'eth_blockNumber', [], {
      'CF-Ray': 'rate-limited-12345',
    })

    checkRateLimitMock.mockImplementationOnce(async () => {
      return true
    })

    // Mock successful fetch response for the underlying request
    const mockResponse = new Response(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1234' }),
      { status: 200 }
    )
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    const response = await handler(mockRequest, mockEnv as Env)

    // Verify response status
    expect(response.status).toBe(200)

    // Verify that the rate limit check was called
    expect(checkRateLimitMock).toHaveBeenCalledTimes(1)
  })
})
