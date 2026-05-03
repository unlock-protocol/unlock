import { describe, it, expect, vi, beforeEach } from 'vitest'
import { forwardRequestsToProvider } from '../src/providerClient'
import { oneRpcEndpoints, getFallbackProviders } from '../src/supportedNetworks'
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

  it('does not fall back on non-retryable 4xx errors (e.g. 403 auth failure)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Forbidden', { status: 403 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('HTTP 403')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('falls back when primary returns 429 (rate-limit is provider-specific)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('continues past a 429 fallback to the next fallback provider', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('error code: 525', { status: 525 }))
      .mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114', // Avalanche — primary + publicProvider + 1RPC
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('surfaces definitive 4xx (e.g. 403) from fallback without trying additional fallbacks', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('error code: 525', { status: 525 }))
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('HTTP 403')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('continues past a 404 fallback (likely provider misconfiguration, not bad request)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('error code: 525', { status: 525 }))
      .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('tries the next fallback when a fallback provider throws', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('error code: 525', { status: 525 }))
      .mockRejectedValueOnce(new Error('Fallback network error'))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('returns error when all providers fail with 5xx for chain with two fallbacks', async () => {
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

  it('returns error when all providers fail with 5xx for chain with one fallback', async () => {
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

  it('tries fallbacks when primary fetch throws, then returns error if all fail', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    // Network '1' has publicProvider + 1RPC fallbacks = 3 total attempts
    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('succeeds via fallback when primary fetch throws', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('treats AbortSignal timeout the same as a network throw — fallback fires', async () => {
    const timeoutError = new DOMException(
      'The operation was aborted.',
      'TimeoutError'
    )
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('primary 404 tries fallbacks (consistent with fallback 404 handling)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
      .mockResolvedValueOnce(new Response(successResponse, { status: 200 }))

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '43114',
      mockEnv as any
    )
    expect(result.responses).toHaveLength(1)
    expect(result.responses![0]).toMatchObject({ result: '0x1234' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('returns error when provider returns 200 with non-JSON body (e.g. HTML error page)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('<html>Error page</html>', { status: 200 })
      )

    const result = await forwardRequestsToProvider(
      [mockRpcRequest],
      '1',
      mockEnv as any
    )
    expect(result.error).toBeDefined()
    expect(result.error?.message).toContain('Failed to parse provider response')
    expect(result.error?.status).toBe(200)
  })

  it('all oneRpcEndpoints keys are present in the supported networks list', () => {
    // Every 1RPC entry must correspond to a chain we actually serve — catches
    // copy-paste drift between oneRpcEndpoints and supportedNetworks.
    const oneRpcNetworkIds = Object.keys(oneRpcEndpoints)
    for (const networkId of oneRpcNetworkIds) {
      // getFallbackProviders returns the 1RPC URL only when the network exists,
      // so a non-empty result confirms the chain is in the supported map.
      const fallbacks = getFallbackProviders(networkId)
      const hasOneRpc = fallbacks.some((url) =>
        url.startsWith('https://1rpc.io')
      )
      expect(
        hasOneRpc,
        `networkId ${networkId} in oneRpcEndpoints but not reachable via getFallbackProviders`
      ).toBe(true)
    }
  })
})
