import { vi } from 'vitest'
import { Env } from '../../src/types'

/**
 * Comprehensive mocks for testing
 * This file centralizes all common mocks to avoid duplication
 */

// Mock the cache API
export const setupCacheMocks = () => {
  // Don't create default mock implementations that always return null
  // Let each test set up its own expected behavior
  const mockMatch = vi.fn()
  const mockPut = vi.fn()

  // @ts-ignore - Mocking global.caches
  global.caches = {
    default: {
      match: mockMatch,
      put: mockPut,
    },
  }

  return { mockMatch, mockPut }
}

// Mock the fetch API
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

// Mock the rateLimit module with consistent behavior
export const setupRateLimitMocks = () => {
  vi.mock('../../src/rateLimit', async () => {
    const actual = (await vi.importActual('../../src/rateLimit')) as any
    return {
      ...actual,
      // Only mock these functions when we need to, but don't override by default
      // in tests that actually test these functions
      checkRateLimit: actual.checkRateLimit,
      shouldRateLimit: actual.shouldRateLimit,
      shouldRateLimitIp: actual.shouldRateLimitIp,
      shouldRateLimitSingle: actual.shouldRateLimitSingle,
      isUnlockContract: actual.isUnlockContract,
      getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
    }
  })
}

// Mock the unlockContracts module
export const setupUnlockContractsMocks = () => {
  vi.mock('../../src/unlockContracts', async () => {
    const actual = (await vi.importActual('../../src/unlockContracts')) as any
    return {
      ...actual,
      isKnownUnlockContract: vi.fn().mockReturnValue(false),
      checkIsLock: vi.fn().mockResolvedValue(false),
    }
  })
}

// Mock the utils module
export const setupUtilsMocks = () => {
  vi.mock('../../src/utils', async () => {
    const actual = await vi.importActual('../../src/utils')
    return {
      ...actual,
      getContractAddress: vi.fn().mockImplementation((method, params) => {
        if (method === 'eth_call' && params && params[0] && params[0].to) {
          return params[0].to
        }
        return null
      }),
      isRequestCacheable: vi.fn().mockReturnValue(true),
      getCacheTTL: vi.fn().mockReturnValue(3600),
      createCacheKey: vi
        .fn()
        .mockReturnValue(
          'https://cache.unlock-protocol.com/rpc-cache/1/eth_call/mock-params'
        ),
      getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
      hasValidLocksmithSecret: vi.fn().mockReturnValue(false),
    }
  })
}

// Create a standard mock environment
export const createMockEnv = (): Partial<Env> & {
  NETWORK_CONFIG?: Record<string, { rpcUrl: string }>
} => ({
  CACHE_DURATION_SECONDS: '3600',
  // RPC providers
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
  // Rate limiters
  STANDARD_RATE_LIMITER: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
  HOURLY_RATE_LIMITER: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
  LOCKSMITH_SECRET_KEY: 'test-secret-key',
  // Network config for tests
  NETWORK_CONFIG: {
    '1': { rpcUrl: 'https://mock-mainnet.example.com' },
    '10': { rpcUrl: 'https://mock-optimism.example.com' },
  },
})

/**
 * Setup all global mocks at once
 * This is the main function to call at the beginning of each test file
 */
export const setupGlobalMocks = () => {
  vi.resetAllMocks()
  setupCacheMocks()
  setupFetchMock()
  setupRateLimitMocks()
  setupUnlockContractsMocks()
  setupUtilsMocks()
}

export default setupGlobalMocks
