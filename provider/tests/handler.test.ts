import { describe, test, expect, vi, beforeEach } from 'vitest'
import handler from '../src/handler'
import { Env } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import {
  createMockEnv,
  createMockRequest,
  setupGlobalMocks,
} from './__fixtures__/testUtils'
import * as batchProcessor from '../src/batchProcessor'
import * as requestProcessor from '../src/requestProcessor'

interface ExtendedMockEnv extends Partial<Env> {
  NETWORK_CONFIG?: Record<string, { rpcUrl: string }>
  [key: string]: any
}

describe('Handler Functionality', () => {
  let mockEnv: ExtendedMockEnv
  let mockRequest: Request

  beforeEach(() => {
    setupGlobalMocks()
    mockEnv = createMockEnv() as ExtendedMockEnv

    mockEnv['1_PROVIDER'] = 'https://mock-mainnet.example.com'

    mockRequest = createMockRequest('1')

    // Mock the batch processor to avoid actual processing
    vi.spyOn(requestProcessor, 'processBatchRequests').mockImplementation(
      async (requests) => {
        return {
          processedRequests: requests.map((req) => ({
            request: req,
            response: null,
            shouldForward: true,
            rateLimited: false,
          })),
          requestsToForward: requests,
        }
      }
    )

    vi.spyOn(batchProcessor, 'processAndForwardRequests').mockImplementation(
      async (body, networkId, originalRequest, env) => {
        const isBatchRequest = Array.isArray(body)
        const responses = isBatchRequest
          ? body.map((req) => ({
              jsonrpc: '2.0',
              id: req.id,
              result: '0x1234',
            }))
          : [{ jsonrpc: '2.0', id: (body as any).id, result: '0x1234' }]

        return {
          responses,
          isBatchRequest,
        }
      }
    )
  })

  test('Basic functionality - handles valid requests', async () => {
    const expectedResponse = { jsonrpc: '2.0', id: 1, result: '0x1234' }
    const mockResponse = new Response(JSON.stringify(expectedResponse), {
      status: 200,
    })

    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

    // Ensure we're using a supported network ID
    mockRequest = createMockRequest('1', 'eth_blockNumber')

    const response = await handler(mockRequest, mockEnv as Env)
    expect(response.status).toBe(200)

    const responseBody = await response.json()
    expect(responseBody).toEqual(expectedResponse)
  })

  test('Handles invalid network ID', async () => {
    const invalidRequest = createMockRequest(
      'invalid',
      'eth_blockNumber',
      [],
      {},
      '127.0.0.1'
    )

    const response = await handler(invalidRequest, mockEnv as Env)
    expect(response.status).toBe(404)

    const responseBody = (await response.json()) as { message: string }
    expect(responseBody.message).toBeDefined()
    expect(responseBody.message).toContain('Unsupported network ID')
  })

  test('Handles unsupported HTTP methods', async () => {
    const getRequest = new Request('https://rpc.unlock-protocol.com/1', {
      method: 'GET',
      headers: {
        'CF-Connecting-IP': '127.0.0.1',
      },
    })

    const response = await handler(getRequest, mockEnv as Env)
    expect(response.status).toBe(400)

    const responseBody = (await response.json()) as { message: string }
    expect(responseBody.message).toBeDefined()
    expect(responseBody.message).toContain('Method GET not supported')
  })

  describe('Rate Limiting', () => {
    test('Should process requests that are not rate limited', async () => {
      const mockRateRequest = createMockRequest(
        '1',
        'eth_blockNumber',
        [],
        {
          'CF-Ray': '12345678abcdef',
        },
        '127.0.0.1'
      )

      const expectedResponse = { jsonrpc: '2.0', id: 1, result: '0x1234' }
      const mockResponse = new Response(JSON.stringify(expectedResponse), {
        status: 200,
      })
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      vi.spyOn(rateLimit, 'shouldRateLimit').mockResolvedValue(false)

      const response = await handler(mockRateRequest, mockEnv as Env)
      expect(response.status).toBe(200)

      const responseBody = await response.json()
      expect(responseBody).toEqual(expectedResponse)
    })

    test('Should handle rate limited requests', async () => {
      const mockRateRequest = createMockRequest(
        '1',
        'eth_blockNumber',
        [],
        {
          'CF-Ray': 'rate-limited-12345',
        },
        '127.0.0.1'
      )

      vi.spyOn(requestProcessor, 'processBatchRequests').mockImplementationOnce(
        async (requests) => {
          return {
            processedRequests: requests.map((req) => ({
              request: req,
              response: null,
              shouldForward: true,
              rateLimited: true,
            })),
            requestsToForward: requests,
          }
        }
      )

      const expectedResponse = { jsonrpc: '2.0', id: 1, result: '0x1234' }
      const mockResponse = new Response(JSON.stringify(expectedResponse), {
        status: 200,
      })
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse)

      const response = await handler(mockRateRequest, mockEnv as Env)
      expect(response.status).toBe(200)

      const responseBody = await response.json()
      expect(responseBody).toEqual(expectedResponse)
    })

    test('Should have special handling for Unlock contracts', async () => {
      vi.spyOn(rateLimit, 'shouldRateLimit').mockImplementation(
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
      const unlockResult = await rateLimit.shouldRateLimit(
        new Request('https://example.com'),
        mockEnv as Env,
        unlockRequest,
        '1'
      )

      // Unlock contracts should not be rate limited
      expect(unlockResult).toBe(false)

      const nonUnlockResult = await rateLimit.shouldRateLimit(
        new Request('https://example.com'),
        mockEnv as Env,
        nonUnlockRequest,
        '1'
      )

      // Non-Unlock contracts should be rate limited
      expect(nonUnlockResult).toBe(true)
    })
  })
})
