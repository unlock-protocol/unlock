import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ethers } from 'ethers'

const defaultLockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'

const { mockGetLock, mockKeyDataGet } = vi.hoisted(() => ({
  mockGetLock: vi.fn(),
  mockKeyDataGet: vi.fn(),
}))

vi.mock('../../src/initializers', () => ({
  getWeb3Service: () => ({
    getLock: mockGetLock,
  }),
}))

vi.mock('../../src/utils/keyData', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: mockKeyDataGet,
    })),
  }
})

import { getKeyIconGrayscale } from '../../src/operations/lockOperations'

describe('lockOperations', () => {
  beforeEach(() => {
    mockGetLock.mockReset()
    mockKeyDataGet.mockReset()
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
  })

  describe('getKeyIconGrayscale', () => {
    it('returns a linear grayscale amount based on time remaining', async () => {
      mockKeyDataGet.mockResolvedValue({
        expiration: 1500,
      })
      mockGetLock.mockResolvedValue({
        expirationDuration: '1000',
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(0.5)
    })

    it('returns full grayscale for expired keys', async () => {
      mockKeyDataGet.mockResolvedValue({
        expiration: 999,
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(1)
    })

    it('returns 0 for non-expiring keys', async () => {
      mockKeyDataGet.mockResolvedValue({
        expiration: undefined,
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(0)
    })

    it('returns 0 when the lock has no expiration duration (MaxUint256)', async () => {
      mockKeyDataGet.mockResolvedValue({
        expiration: 1500,
      })
      mockGetLock.mockResolvedValue({
        expirationDuration: ethers.MaxUint256.toString(),
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(0)
    })

    it('returns close to 1 for a key expiring imminently', async () => {
      // now = 1000s, expiration = 1010s (10s left), totalDuration = 1000s
      // grayscale = 1 - 10/1000 = 0.99
      mockKeyDataGet.mockResolvedValue({
        expiration: 1010,
      })
      mockGetLock.mockResolvedValue({
        expirationDuration: '1000',
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBeCloseTo(0.99)
    })

    it('returns 0 when expiration data cannot be fetched', async () => {
      mockKeyDataGet.mockRejectedValue(new Error('subgraph unavailable'))

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(0)
    })
  })
})
