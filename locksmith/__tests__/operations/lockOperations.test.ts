// ABOUTME: Tests for lock operations that drive generated key icons.
// ABOUTME: Covers the grayscale applied to a key's icon once it has expired.

import { beforeEach, describe, expect, it, vi } from 'vitest'

const defaultLockAddress = '0xb0Feb7BA761A31548FF1cDbEc08affa8FFA3e691'

const { mockKeyDataGet } = vi.hoisted(() => ({
  mockKeyDataGet: vi.fn(),
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
    mockKeyDataGet.mockReset()
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
  })

  describe('getKeyIconGrayscale', () => {
    it('returns 0 for keys that are still valid', async () => {
      mockKeyDataGet.mockResolvedValue({
        expiration: 1500,
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(0)
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

    it('returns 0 for a key expiring imminently', async () => {
      // now = 1000s, expiration = 1010s: still valid for 10s
      mockKeyDataGet.mockResolvedValue({
        expiration: 1010,
      })

      const grayscale = await getKeyIconGrayscale({
        network: 1,
        lockAddress: defaultLockAddress,
        keyId: '1',
      })

      expect(grayscale).toBe(0)
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
