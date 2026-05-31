import { describe, expect, it } from 'vitest'
import {
  getCheckoutConfigLocks,
  shouldSyncEventImageToNft,
} from '~/components/content/event/Settings/utils'

describe('event Settings utils', () => {
  describe('getCheckoutConfigLocks', () => {
    it('returns event locks with their specific or fallback network', () => {
      const locks = getCheckoutConfigLocks({
        config: {
          network: 1,
          locks: {
            '0xlock-a': {
              network: 137,
            },
            '0xlock-b': {},
          },
        },
      })

      expect(locks).toEqual([
        {
          lockAddress: '0xlock-a',
          network: 137,
        },
        {
          lockAddress: '0xlock-b',
          network: 1,
        },
      ])
    })

    it('skips locks without a network', () => {
      const locks = getCheckoutConfigLocks({
        config: {
          locks: {
            '0xlock-a': {},
          },
        },
      })

      expect(locks).toEqual([])
    })
  })

  describe('shouldSyncEventImageToNft', () => {
    it('syncs when the NFT image still matches the previous event image', () => {
      expect(
        shouldSyncEventImageToNft({
          nextEventImage: 'https://example.com/new.png',
          previousEventImage: 'https://example.com/old.png',
          currentNftImage: 'https://example.com/old.png',
        })
      ).toBe(true)
    })

    it('does not sync when the NFT image was customized', () => {
      expect(
        shouldSyncEventImageToNft({
          nextEventImage: 'https://example.com/new.png',
          previousEventImage: 'https://example.com/old.png',
          currentNftImage: 'https://example.com/custom.png',
        })
      ).toBe(false)
    })

    it('does not sync when the event image was unchanged', () => {
      expect(
        shouldSyncEventImageToNft({
          nextEventImage: 'https://example.com/old.png',
          previousEventImage: 'https://example.com/old.png',
          currentNftImage: 'https://example.com/old.png',
        })
      ).toBe(false)
    })

    it('does not sync when the lock has no current NFT image to compare', () => {
      expect(
        shouldSyncEventImageToNft({
          nextEventImage: 'https://example.com/new.png',
          previousEventImage: 'https://example.com/old.png',
        })
      ).toBe(false)
    })

    it('does not sync without both previous and next event images', () => {
      expect(
        shouldSyncEventImageToNft({
          previousEventImage: 'https://example.com/old.png',
          currentNftImage: 'https://example.com/old.png',
        })
      ).toBe(false)

      expect(
        shouldSyncEventImageToNft({
          nextEventImage: 'https://example.com/new.png',
          currentNftImage: 'https://example.com/old.png',
        })
      ).toBe(false)
    })
  })
})
