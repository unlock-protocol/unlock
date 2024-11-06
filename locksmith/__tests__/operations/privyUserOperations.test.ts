import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getPrivyUserByEmail,
  getPrivyUserByAddress,
} from '../../src/operations/privyUserOperations'
import logger from '../../src/logger'
import type { User } from '@privy-io/server-auth'

// Mock modules first, before any other code
vi.mock('../../src/utils/privyClient', () => ({
  privy: {
    getUserByEmail: vi.fn(),
    getUserByWalletAddress: vi.fn(),
  },
}))

vi.mock('../../src/logger', () => ({
  default: {
    error: vi.fn(),
  },
}))

// Get the mocked functions after mocking
const { privy } = await import('../../src/utils/privyClient')
const mockGetUserByEmail = vi.mocked(privy!.getUserByEmail)
const mockGetUserByWalletAddress = vi.mocked(privy!.getUserByWalletAddress)

describe('PrivyUserOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPrivyUserByEmail', () => {
    it('should return success with user when Privy returns a user', async () => {
      const mockUser: User = {
        id: '123',
        createdAt: new Date(),
        isGuest: false,
        customMetadata: {},
        linkedAccounts: [],
        email: {
          address: 'test@example.com',
          verifiedAt: new Date(),
          firstVerifiedAt: new Date(),
          latestVerifiedAt: new Date(),
        },
      }
      mockGetUserByEmail.mockResolvedValue(mockUser)

      const result = await getPrivyUserByEmail('test@example.com')

      expect(result).toEqual({
        success: true,
        user: mockUser,
      })
      expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should return success with null user when Privy returns null', async () => {
      mockGetUserByEmail.mockResolvedValue(null)

      const result = await getPrivyUserByEmail('test@example.com')

      expect(result).toEqual({
        success: true,
        user: null,
      })
      expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should return failure when Privy throws an error', async () => {
      const error = new Error('Privy API error')
      mockGetUserByEmail.mockRejectedValue(error)

      const result = await getPrivyUserByEmail('test@example.com')

      expect(result).toEqual({
        success: false,
        user: null,
        error: 'Failed to fetch user from Privy',
      })
      expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch Privy user by email:',
        error
      )
    })
  })

  describe('getPrivyUserByAddress', () => {
    it('should return success with user when Privy returns a user', async () => {
      const mockUser: User = {
        id: '123',
        createdAt: new Date(),
        isGuest: false,
        customMetadata: {},
        linkedAccounts: [],
        wallet: {
          address: '0x123',
          chainType: 'ethereum',
          verifiedAt: new Date(),
          firstVerifiedAt: new Date(),
          latestVerifiedAt: new Date(),
        },
      }
      mockGetUserByWalletAddress.mockResolvedValue(mockUser)

      const result = await getPrivyUserByAddress('0x123')

      expect(result).toEqual({
        success: true,
        user: mockUser,
      })
      expect(mockGetUserByWalletAddress).toHaveBeenCalledWith('0x123')
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should return success with null user when Privy returns null', async () => {
      mockGetUserByWalletAddress.mockResolvedValue(null)

      const result = await getPrivyUserByAddress('0x123')

      expect(result).toEqual({
        success: true,
        user: null,
      })
      expect(mockGetUserByWalletAddress).toHaveBeenCalledWith('0x123')
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should return failure when Privy throws an error', async () => {
      const error = new Error('Privy API error')
      mockGetUserByWalletAddress.mockRejectedValue(error)

      const result = await getPrivyUserByAddress('0x123')

      expect(result).toEqual({
        success: false,
        user: null,
        error: 'Failed to fetch user from Privy',
      })
      expect(mockGetUserByWalletAddress).toHaveBeenCalledWith('0x123')
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch Privy user by wallet address:',
        error
      )
    })
  })
})
