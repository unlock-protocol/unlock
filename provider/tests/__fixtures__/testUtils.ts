import { vi } from 'vitest'
import { Env } from '../../src/types'

// Mock environment that can be reused
export const createMockEnv = (): Partial<Env> => ({
  CACHE_DURATION_SECONDS: '3600',
  // Add mock values for the RPC providers
  ARBITRUM_PROVIDER: 'https://mock-arbitrum.example.com',
  AVALANCHE_PROVIDER: 'https://mock-avalanche.example.com',
  BSC_PROVIDER: 'https://mock-bsc.example.com',
  CELO_PROVIDER: 'https://mock-celo.example.com',
  GNOSIS_PROVIDER: 'https://mock-gnosis.example.com',
  MAINNET_PROVIDER: 'https://mock-mainnet.example.com',
  OPTIMISM_PROVIDER: 'https://mock-optimism.example.com',
  POLYGON_PROVIDER: 'https://mock-polygon.example.com',
  SEPOLIA_PROVIDER: 'https://mock-sepolia.example.com',
  BASE_PROVIDER: 'https://mock-base.example.com',
  BASE_SEPOLIA_PROVIDER: 'https://mock-base-sepolia.example.com',
  ZKSYNC_PROVIDER: 'https://mock-zksync.example.com',
  LINEA_PROVIDER: 'https://mock-linea.example.com',
  ZKEVM_PROVIDER: 'https://mock-zkevm.example.com',
  SCROLL_PROVIDER: 'https://mock-scroll.example.com',
  // mock values for rate limiters
  STANDARD_RATE_LIMITER: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
  HOURLY_RATE_LIMITER: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
  LOCKSMITH_SECRET_KEY: 'test-secret-key',
})

// Helper to create a mock request
export const createMockRequest = (
  networkId: string | number = '1',
  method = 'eth_blockNumber',
  params: any[] = [],
  headers: Record<string, string> = {}
) => {
  return new Request(`https://rpc.unlock-protocol.com/${networkId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '127.0.0.1',
      ...headers,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })
}

// Helper to create a request for eth_call
export const createEthCallRequest = (
  contractAddress = '0x123456789abcdef',
  data = '0x3b3b57de0000000000000000000000000000000000000000000000000000000000000000',
  networkId = '1'
) => {
  return createMockRequest(networkId, 'eth_call', [
    {
      to: contractAddress,
      data,
    },
    'latest',
  ])
}

// Helper to setup fetch mock
export const setupFetchMock = (result = '0x1234', status = 200) => {
  global.fetch = vi.fn().mockImplementation(() => {
    return Promise.resolve(
      new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result }), {
        status,
      })
    )
  })

  return global.fetch
}

// Define a type for our mocked cache functions
export interface MockedCacheStorage {
  default: {
    match: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
  }
}

// Setup cache mocks
export const setupCacheMocks = () => {
  const mockMatch = vi.fn()
  const mockPut = vi.fn().mockResolvedValue(undefined)

  // @ts-ignore - Mocking global.caches which doesn't exist in the standard DOM types
  global.caches = {
    default: {
      match: mockMatch,
      put: mockPut,
    },
  } as unknown as MockedCacheStorage

  return { mockMatch, mockPut }
}

// Common beforeEach setup for all tests
export const setupCommonBeforeEach = () => {
  vi.resetAllMocks()
  setupFetchMock()
}
