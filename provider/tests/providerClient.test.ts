// ABOUTME: Tests for providerClient — primary provider forwarding and fallback behavior
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

  it('forwards to primary provider and returns parsed response', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(successResponse, { status: 200 })
    )

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
    const singleResponse = JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xabc' })
    global.fetch = vi.fn().mockResolvedValue(
      new Response(singleResponse, { status: 200 })
    )

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0xabc' })
  })

  it('falls back to public provider when primary returns 525', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('error code: 525', { status: 525 })
      )
      .mockResolvedValueOnce(
        new Response(successResponse, { status: 200 })
      )

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114', // Avalanche — has a known fallback
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to public provider when primary returns non-OK status', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '56', // BSC — has a known fallback
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('returns error when primary fails and no fallback exists', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response('error code: 525', { status: 525 })
    )

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1', // ETH mainnet — no fallback
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('returns error when both primary and fallback fail', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response('error code: 525', { status: 525 })
    )

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114', // Avalanche — fallback exists but also fails
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
