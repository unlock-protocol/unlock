import { ethers } from 'ethers'
import { vi } from 'vitest'

vi.mock('../../src/models', () => ({
  LockIcons: {},
  LockMetadata: {},
  UserTokenMetadata: {},
}))

vi.mock('../../src/initializers', () => ({
  getWeb3Service: vi.fn(),
}))

vi.mock('../../src/utils/keyData', () => ({
  default: class KeyData {
    get = vi.fn()
  },
}))

vi.mock('../../src/utils/ticket', () => ({
  ticketForFilBangalore: vi.fn(() => Promise.resolve('<svg>ticket</svg>')),
}))

import {
  getKeyIcon,
  getMembershipIconGrayscale,
} from '../../src/operations/lockOperations'
import { ticketForFilBangalore } from '../../src/utils/ticket'

describe('lockOperations', () => {
  describe('getMembershipIconGrayscale', () => {
    const now = 1_700_000_000

    it('returns fully grayscale for expired keys', () => {
      expect(
        getMembershipIconGrayscale({
          expiration: now - 1,
          expirationDuration: 60 * 60 * 24 * 30,
          now,
        })
      ).toEqual(1)
    })

    it('returns partial grayscale as the key approaches expiration', () => {
      expect(
        getMembershipIconGrayscale({
          expiration: now + 25,
          expirationDuration: 100,
          now,
        })
      ).toEqual(0.75)
    })

    it('does not grayscale non-expiring locks', () => {
      expect(
        getMembershipIconGrayscale({
          expiration: now + 25,
          expirationDuration: ethers.MaxUint256.toString(),
          now,
        })
      ).toEqual(0)
    })
  })

  describe('getKeyIcon', () => {
    it('preserves the FilBangalore custom key icon for the configured Arbitrum lock', async () => {
      expect.assertions(2)

      const icon = await getKeyIcon({
        network: 42161,
        lockAddress: '0x02c510bE69fe87E052E065D8A40B437d55907B48',
        keyId: '42',
      })

      expect(ticketForFilBangalore).toHaveBeenCalledWith({
        network: 42161,
        lockAddress: '0x02c510bE69fe87E052E065D8A40B437d55907B48',
        tokenId: '42',
      })
      expect(icon).toEqual({
        icon: '<svg>ticket</svg>',
        isGenerated: false,
        isURL: false,
        type: 'image/svg+xml',
      })
    })
  })
})
