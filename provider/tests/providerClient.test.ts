import { describe, it, expect, vi, beforeEach } from 'vitest'
import { forwardRequestsToProvider } from '../src/providerClient'
import { createMockEnv, setupGlobalMocks } from './__fixtures__/testUtils'

const mockRpcRequest = {
  jsonrpc: '2.0' as const,
  id: 1,
  method: 'eth_blockNumber',
  params: [],
}

const successResponse = JSON.stringify([
  { jsonrpc: '2.0', id: 1, result: '0x1234' },
])

describe('forwardRequestsToProvider', () => {
  let mockEnv: ReturnType<typeof createMockEnv>

  beforeEach(() => {
    setupGlobalMocks()
    mockEnv = createMockEnv()
  })

  it('returns empty array when no requests to forward', async () => {
    const result = await forwardRequestsToProvider([], '1', mockEnv as any)
    expect(result).toEqual({ responses: [] })
  })

  it('returns error for unsupported network', async () => {
    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '99999',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Unsupported network')
  })

  it('forwards to primary provider and returns parsed response', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('wraps single response object in array', async () => {
    const singleResponse = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: '0xabc',
    })
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(singleResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0xabc' })
  })

  it('falls back to level 1 (networks publicProvider) when primary returns 5xx', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('error code: 525', { status: 525 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114', // Avalanche — has publicProvider + 1RPC as fallbacks
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to level 2 (1RPC) when primary and level 1 both return 5xx', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('error code: 525', { status: 525 }))
      .mockResolvedValueOnce(
        new Response('Service Unavailable', { status: 503 })
      )
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114', // Avalanche — has both level 1 and level 2 fallbacks
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('does not fall back on 4xx errors (e.g. rate limit)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Too Many Requests', { status: 429 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('returns error when all providers fail for chain with two fallbacks', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('error code: 525', { status: 525 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114', // Avalanche — primary + 2 fallbacks = 3 total calls
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('returns error when all providers fail for chain with one fallback', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('error code: 525', { status: 525 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '84532', // Base Sepolia — primary + 1 fallback (no 1RPC) = 2 total calls
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('returns error when fetch itself throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Failed to forward')
  })
})
