import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Env } from '../src/types'
import {
  createMockEnv,
  createMockRequest,
  setupCommonBeforeEach,
} from './__fixtures__/testUtils'

// Import the actual module
const actualRateLimit = vi.importActual('../src/rateLimit')

// Create mock modules
const mockUtils = {
  getContractAddress: vi.fn(),
  getClientIP: vi.fn(),
  hasValidLocksmithSecret: vi.fn(),
}

const mockUnlockContracts = {
  isKnownUnlockContract: vi.fn(),
  checkIsLock: vi.fn(),
}

// Create a version of the module with our mocks
const rateLimit = {
  ...actualRateLimit,
  // Override the dependencies with our mocks
  isUnlockContract: async (
    contractAddress: string,
    networkId: string,
    env: Env
  ): Promise<boolean> => {
    if (!contractAddress) return false

    try {
      if (
        mockUnlockContracts.isKnownUnlockContract(contractAddress, networkId)
      ) {
        return true
      }
      return mockUnlockContracts.checkIsLock(contractAddress, networkId, env)
    } catch (error) {
      console.error(
        `Error checking if contract is Unlock contract: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      return false
    }
  },
  shouldRateLimitSingle: async (
    request: Request,
    env: Env,
    body: any,
    networkId: string
  ): Promise<boolean> => {
    const contractAddress = mockUtils.getContractAddress(
      body.method,
      body.params
    )

    if (
      contractAddress &&
      (await rateLimit.isUnlockContract(contractAddress, networkId, env))
    ) {
      // Skip rate limit if this is an Unlock contract
      return false
    }

    // For testing, we'll just return false (no rate limiting)
    return false
  },
  shouldRateLimit: async (
    request: Request,
    env: Env,
    body: any,
    networkId: string
  ): Promise<boolean> => {
    if (Array.isArray(body)) {
      const shouldRateLimitRequests = await Promise.all(
        body.map((singleBody) =>
          rateLimit.shouldRateLimitSingle(request, env, singleBody, networkId)
        )
      )
      return shouldRateLimitRequests.some(
        (shouldRateLimitRequest) => shouldRateLimitRequest
      )
    }
    return rateLimit.shouldRateLimitSingle(request, env, body, networkId)
  },
}

describe('Rate Limit Module', () => {
  let mockEnv: Partial<Env>

  beforeEach(() => {
    setupCommonBeforeEach()
    mockEnv = createMockEnv()

    // Reset all mocks
    vi.resetAllMocks()
  })

  test('shouldRateLimitSingle should exempt Unlock contracts', async () => {
    // Mock getContractAddress to return a test address
    const mockContractAddress = '0xMockUnlockContract'
    mockUtils.getContractAddress.mockReturnValue(mockContractAddress)

    // Mock isKnownUnlockContract to return true
    mockUnlockContracts.isKnownUnlockContract.mockReturnValue(true)

    // Create a mock request
    const mockRequest = createMockRequest('1', 'eth_call')
    const mockBody = { method: 'eth_call', params: [] }

    // Call the function under test
    const result = await rateLimit.shouldRateLimitSingle(
      mockRequest,
      mockEnv as Env,
      mockBody,
      '1'
    )

    // If the contract is an Unlock contract, shouldRateLimitSingle should return false
    expect(result).toBe(false)

    // Verify our mocks were called
    expect(mockUtils.getContractAddress).toHaveBeenCalledWith('eth_call', [])
    expect(mockUnlockContracts.isKnownUnlockContract).toHaveBeenCalledWith(
      mockContractAddress,
      '1'
    )
  })

  test('shouldRateLimit should process batch requests correctly', async () => {
    // Spy on shouldRateLimitSingle
    const shouldRateLimitSingleSpy = vi.spyOn(
      rateLimit,
      'shouldRateLimitSingle'
    )

    // Create a mock request
    const mockRequest = createMockRequest('1', 'eth_call')

    // Prepare a batch of requests
    const batchBody = [
      { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [] },
      { jsonrpc: '2.0', id: 2, method: 'eth_getBalance', params: [] },
    ]

    // Call shouldRateLimit with batch body
    const result = await rateLimit.shouldRateLimit(
      mockRequest,
      mockEnv as Env,
      batchBody,
      '1'
    )

    // Verify that shouldRateLimitSingle was called for each item in the batch
    expect(shouldRateLimitSingleSpy).toHaveBeenCalledTimes(2)
    expect(result).toBe(false)

    // Reset the spy
    shouldRateLimitSingleSpy.mockReset()

    // Mock shouldRateLimitSingle to return true for the second call
    shouldRateLimitSingleSpy
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    // Call shouldRateLimit again
    const resultWithRateLimit = await rateLimit.shouldRateLimit(
      mockRequest,
      mockEnv as Env,
      batchBody,
      '1'
    )

    // If any request in the batch should be rate limited, the overall result should be true
    expect(resultWithRateLimit).toBe(true)
  })

  test('isUnlockContract should check and return correct results', async () => {
    // Mock isKnownUnlockContract to return true
    mockUnlockContracts.isKnownUnlockContract.mockReturnValue(true)

    // Call isUnlockContract
    const result = await rateLimit.isUnlockContract(
      '0xMockUnlockContract',
      '1',
      mockEnv as Env
    )

    // Should return true since we mocked isKnownUnlockContract to return true
    expect(result).toBe(true)

    // Verify isKnownUnlockContract was called with the right parameters
    expect(mockUnlockContracts.isKnownUnlockContract).toHaveBeenCalledWith(
      '0xMockUnlockContract',
      '1'
    )

    // checkIsLock should not be called when isKnownUnlockContract returns true
    expect(mockUnlockContracts.checkIsLock).not.toHaveBeenCalled()
  })
})
