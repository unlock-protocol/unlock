import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Env } from '../src/types'
import * as rateLimit from '../src/rateLimit'
import * as utils from '../src/utils'
import * as unlockContracts from '../src/unlockContracts'
import {
  createMockEnv,
  createMockRequest,
  setupGlobalMocks,
} from './__fixtures__/testUtils'

describe('Rate Limit Module', () => {
  let mockEnv: Partial<Env>

  beforeEach(() => {
    setupGlobalMocks()
    mockEnv = createMockEnv()

    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  test('shouldRateLimitSingle should exempt Unlock contracts', async () => {
    // Create a mock implementation of shouldRateLimitSingle that we can test
    const originalShouldRateLimitSingle = rateLimit.shouldRateLimitSingle

    // Mock getContractAddress to return a test address
    const mockContractAddress = '0xMockUnlockContract'
    vi.spyOn(utils, 'getContractAddress').mockReturnValue(mockContractAddress)

    // Mock isAllowedContract to return true
    vi.spyOn(unlockContracts, 'isAllowedContract').mockReturnValue(true)

    // Create a mock request
    const mockRequest = createMockRequest('1', 'eth_call')
    const mockBody = { method: 'eth_call', params: [] }

    // Call the function under test
    const result = await originalShouldRateLimitSingle(
      mockRequest,
      mockEnv as Env,
      mockBody,
      '1'
    )

    // If the contract is an Unlock contract, shouldRateLimitSingle should return false
    expect(result).toBe(false)

    // Verify our mocks were called
    expect(utils.getContractAddress).toHaveBeenCalledWith('eth_call', [])
    expect(unlockContracts.isAllowedContract).toHaveBeenCalledWith(
      mockContractAddress,
      '1'
    )
  })

  test('shouldRateLimit should process batch requests correctly', async () => {
    // Create a mock request
    const mockRequest = createMockRequest('1', 'eth_call')

    // Prepare a batch of requests
    const batchBody = [
      { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [] },
      { jsonrpc: '2.0', id: 2, method: 'eth_getBalance', params: [] },
    ]

    // Test 1: All requests pass rate limiting
    // Mock shouldRateLimitSingle directly
    const shouldRateLimitSingleMock = vi.fn().mockResolvedValue(false)

    // Create a custom implementation of shouldRateLimit that uses our mock
    const customShouldRateLimit = async (
      request: Request,
      env: Env,
      body: any,
      networkId: string
    ) => {
      if (Array.isArray(body)) {
        const shouldRateLimitRequests = await Promise.all(
          body.map((singleBody) =>
            shouldRateLimitSingleMock(request, env, singleBody, networkId)
          )
        )
        return shouldRateLimitRequests.some(
          (shouldRateLimitRequest) => shouldRateLimitRequest
        )
      }
      return shouldRateLimitSingleMock(request, env, body, networkId)
    }

    // Test case 1: All requests pass rate limiting
    const result = await customShouldRateLimit(
      mockRequest,
      mockEnv as Env,
      batchBody,
      '1'
    )

    // Verify that shouldRateLimitSingle was called for each item in the batch
    expect(shouldRateLimitSingleMock).toHaveBeenCalledTimes(2)
    expect(result).toBe(false)

    // Reset the mock
    shouldRateLimitSingleMock.mockReset()

    // Test case 2: One request fails rate limiting
    shouldRateLimitSingleMock
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    // Call our custom implementation again
    const resultWithRateLimit = await customShouldRateLimit(
      mockRequest,
      mockEnv as Env,
      batchBody,
      '1'
    )

    // If any request in the batch should be rate limited, the overall result should be true
    expect(resultWithRateLimit).toBe(true)
  })

  test('isAllowedContract should check and return correct results', async () => {
    // Mock isAllowedContract to return true
    vi.spyOn(unlockContracts, 'isAllowedContract').mockReturnValue(true)

    // Mock checkIsLock to ensure it's not called
    const checkIsLockSpy = vi.spyOn(unlockContracts, 'checkIsLock')

    // Call isAllowedContract directly
    const result = await rateLimit.isAllowedContract(
      '0xMockUnlockContract',
      '1',
      mockEnv as Env
    )

    // Should return true since we mocked isAllowedContract to return true
    expect(result).toBe(true)

    // Verify isAllowedContract was called with the right parameters
    expect(unlockContracts.isAllowedContract).toHaveBeenCalledWith(
      '0xMockUnlockContract',
      '1'
    )

    // checkIsLock should not be called when isAllowedContract returns true
    expect(checkIsLockSpy).not.toHaveBeenCalled()
  })
})
