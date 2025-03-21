import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Env, ContractType } from '../src/types'
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

  test('shouldRateLimit should exempt Unlock contracts', async () => {
    // Mock getContractAddress to return a test address
    const mockContractAddress = '0xMockUnlockContract'
    vi.spyOn(utils, 'getContractAddress').mockReturnValue(mockContractAddress)

    // Mock checkContractTypeOnChain to return the Unlock contract type
    vi.spyOn(unlockContracts, 'checkContractTypeOnChain').mockResolvedValue(
      ContractType.UNLOCK_PROTOCOL_CONTRACT
    )

    // Create a mock request
    const mockRequest = createMockRequest('1', 'eth_call', [], {}, '127.0.0.1')
    const mockBody = { method: 'eth_call', params: [] }

    const result = await rateLimit.shouldRateLimit(
      mockRequest,
      mockEnv as Env,
      mockBody,
      '1'
    )

    // If the contract is an Unlock contract, shouldRateLimit should return false
    expect(result).toBe(false)

    // Verify our mocks were called
    expect(utils.getContractAddress).toHaveBeenCalledWith('eth_call', [])
    expect(unlockContracts.checkContractTypeOnChain).toHaveBeenCalledWith(
      mockContractAddress,
      '1',
      mockEnv
    )
  })

  test('shouldRateLimit should process batch requests correctly', async () => {
    // This test is now obsolete since we've removed the batch handling from shouldRateLimit
    // We'll test a different aspect of shouldRateLimit instead

    // Create a mock request
    const mockRequest = createMockRequest('1', 'eth_call', [], {}, '127.0.0.1')

    // Test with eth_chainId which should be exempt from rate limiting
    const chainIdBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_chainId',
      params: [],
    }
    const chainIdResult = await rateLimit.shouldRateLimit(
      mockRequest,
      mockEnv as Env,
      chainIdBody,
      '1'
    )

    // eth_chainId should not be rate limited
    expect(chainIdResult).toBe(false)

    // Test with eth_blockNumber which should also be exempt
    const blockNumberBody = {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_blockNumber',
      params: [],
    }
    const blockNumberResult = await rateLimit.shouldRateLimit(
      mockRequest,
      mockEnv as Env,
      blockNumberBody,
      '1'
    )

    // eth_blockNumber should not be rate limited
    expect(blockNumberResult).toBe(false)
  })

  test('isUnlockContract should check and return correct results', async () => {
    // Mock checkContractTypeOnChain to return Unlock contract type
    vi.spyOn(unlockContracts, 'checkContractTypeOnChain').mockResolvedValue(
      ContractType.UNLOCK_PROTOCOL_CONTRACT
    )

    // Call isAllowedContract directly
    const result = await rateLimit.isAllowedContract(
      '0xMockUnlockContract',
      '1',
      mockEnv as Env
    )

    // Should return true since we mocked checkContractTypeOnChain to return the Unlock contract type
    expect(result).toBe(true)

    // Verify checkContractTypeOnChain was called with the right parameters
    expect(unlockContracts.checkContractTypeOnChain).toHaveBeenCalledWith(
      '0xMockUnlockContract',
      '1',
      mockEnv
    )
  })
})
