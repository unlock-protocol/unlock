import { describe, it, expect, vi, beforeEach, test } from 'vitest'
import {
  processBatchRequests,
  processChainIdRequest,
  processSingleRequest,
} from '../src/requestProcessor'
import { combineResponses } from '../src/batchProcessor'
import { RpcRequest, ProcessedRequest } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import * as cacheModule from '../src/cache'
import { setupGlobalMocks } from './__fixtures__/testUtils'

// Mock dependencies
vi.mock('../src/rateLimit')
vi.mock('../src/cache')

describe('Batch Processor', () => {
  const mockEnv = {
    MAINNET_PROVIDER: 'https://mainnet.example.com',
    STANDARD_RATE_LIMITER: { limit: vi.fn() },
    HOURLY_RATE_LIMITER: { limit: vi.fn() },
  } as any

  const mockRequest = new Request('https://example.com/1', {
    method: 'POST',
  })

  beforeEach(() => {
    setupGlobalMocks()
    vi.resetAllMocks()
  })

  describe('processChainIdRequest', () => {
    it('should correctly process a chainId request', () => {
      const request: RpcRequest = {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      }

      const result = processChainIdRequest(request, '1')
      expect(result).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: '0x1',
      })
    })
  })

  describe('processSingleRequest', () => {
    it('should handle chainId requests locally', async () => {
      const request: RpcRequest = {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
      }

      const result = await processSingleRequest(
        request,
        '1',
        mockRequest,
        mockEnv
      )

      expect(result).toEqual({
        request,
        response: {
          id: 1,
          jsonrpc: '2.0',
          result: '0x1',
        },
        shouldForward: false,
        rateLimited: false,
      })
    })

    it('should handle rate limited requests', async () => {
      const request: RpcRequest = {
        id: 2,
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: '0x123' }, 'latest'],
      }

      vi.mocked(rateLimit.shouldRateLimit).mockResolvedValue(true)

      const result = await processSingleRequest(
        request,
        '1',
        mockRequest,
        mockEnv
      )

      expect(result).toEqual({
        request,
        response: null,
        shouldForward: true,
        rateLimited: true,
      })
    })

    it('should mark requests for forwarding when not handled locally', async () => {
      const request: RpcRequest = {
        id: 4,
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: '0x123' }, 'latest'],
      }

      vi.mocked(rateLimit.shouldRateLimit).mockResolvedValue(false)

      const result = await processSingleRequest(
        request,
        '1',
        mockRequest,
        mockEnv
      )

      expect(result).toEqual({
        request,
        response: null,
        shouldForward: true,
        rateLimited: false,
      })
    })

    it('should return cached response when available', async () => {
      const request: RpcRequest = {
        id: 5,
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: '0x1234' }, 'latest'],
      }
      const envWithCache = { ...mockEnv }

      // Mock the getCachedResponseForRequest function directly
      const mockCachedResponse = {
        id: 5,
        jsonrpc: '2.0',
        result: '0xCached',
      }

      vi.spyOn(cacheModule, 'getCachedResponseForRequest').mockResolvedValue(
        mockCachedResponse
      )

      const result = await processSingleRequest(
        request,
        '1',
        mockRequest,
        envWithCache
      )
      expect(result).toEqual({
        request,
        response: mockCachedResponse,
        shouldForward: false,
        rateLimited: false,
        fromCache: true,
      })
    })
  })

  describe('processBatchRequests', () => {
    it('should process a batch of requests correctly', async () => {
      const requests: RpcRequest[] = [
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
        },
        {
          id: 2,
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: '0x123' }, 'latest'],
        },
      ]

      vi.mocked(rateLimit.shouldRateLimit).mockResolvedValue(false)

      const result = await processBatchRequests(
        requests,
        '1',
        mockRequest,
        mockEnv
      )

      expect(result.processedRequests).toHaveLength(2)
      expect(result.requestsToForward).toHaveLength(1)
      expect(result.requestsToForward[0].id).toBe(2)
    })

    it('should identify when all requests are rate limited', async () => {
      const requests: RpcRequest[] = [
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: '0x123' }, 'latest'],
        },
        {
          id: 2,
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: '0x456' }, 'latest'],
        },
      ]

      vi.mocked(rateLimit.shouldRateLimit).mockResolvedValue(true)

      const result = await processBatchRequests(
        requests,
        '1',
        mockRequest,
        mockEnv
      )

      expect(result.processedRequests).toHaveLength(2)
      expect(result.requestsToForward).toHaveLength(2)
    })
  })

  describe('combineResponses', () => {
    it('should combine local and provider responses correctly', async () => {
      const processedRequests = [
        {
          request: { id: 1, jsonrpc: '2.0', method: 'eth_chainId', params: [] },
          response: { id: 1, jsonrpc: '2.0', result: '0x1' },
          shouldForward: false,
          rateLimited: false,
        },
        {
          request: { id: 2, jsonrpc: '2.0', method: 'eth_call', params: [] },
          response: null,
          shouldForward: true,
          rateLimited: false,
        },
      ]

      const providerResponses = [{ id: 2, jsonrpc: '2.0', result: '0xabc' }]

      const result = await combineResponses(
        processedRequests,
        providerResponses,
        '1',
        mockEnv
      )

      expect(result).toEqual([
        { id: 1, jsonrpc: '2.0', result: '0x1' },
        { id: 2, jsonrpc: '2.0', result: '0xabc' },
      ])
    })

    it('should handle missing provider responses', async () => {
      const processedRequests = [
        {
          request: { id: 1, jsonrpc: '2.0', method: 'eth_chainId', params: [] },
          response: { id: 1, jsonrpc: '2.0', result: '0x1' },
          shouldForward: false,
          rateLimited: false,
        },
        {
          request: { id: 2, jsonrpc: '2.0', method: 'eth_call', params: [] },
          response: null,
          shouldForward: true,
          rateLimited: false,
        },
      ]

      const result = await combineResponses(processedRequests, [], '1', mockEnv)

      expect(result[0]).toEqual({ id: 1, jsonrpc: '2.0', result: '0x1' })
      expect(result[1].error).toBeDefined()
      expect(result[1].error.code).toBe(-32603)
    })

    test('should store response in cache when processed request has shouldCache true and provider response exists', async () => {
      vi.mocked(cacheModule.shouldStore).mockReturnValue(true)
      const processedRequests: ProcessedRequest[] = [
        {
          request: { id: 10, jsonrpc: '2.0', method: 'eth_call', params: [] },
          response: null,
          shouldCache: true,
          shouldForward: true,
          rateLimited: false,
        },
      ]
      const providerResponses = [
        { id: 10, jsonrpc: '2.0', result: '0xcacheTest' },
      ]
      const storeSpy = vi
        .spyOn(cacheModule, 'storeResponseInCache')
        .mockResolvedValue(undefined)

      await combineResponses(processedRequests, providerResponses, '1', mockEnv)
      expect(storeSpy).toHaveBeenCalledWith(
        processedRequests[0].request,
        '1',
        providerResponses[0],
        mockEnv
      )
    })
  })
})
