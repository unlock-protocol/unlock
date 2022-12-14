import Asset from '../../src/utils/assets'
import { vi } from 'vitest'

vi.mock('request-promise-native', () => {
  return {
    default: vi.fn(() => {
      return { statusCode: 200 }
    }),
  }
})

describe('Assets', () => {
  describe('exists', () => {
    describe.skip('when the asset exists', () => {
      it('returns true', async () => {
        expect.assertions(1)
        expect(await Asset.exists('existing_image')).toBe(true)
      })
    })
  })

  describe('tokenMetadataDefaultImage', () => {
    it('returns the relevant image path', () => {
      expect.assertions(1)
      expect(
        Asset.tokenMetadataDefaultImage({
          base: 'host',
          address: 'address',
        })
      ).toEqual('host/address/metadata/default_image')
    })
  })
  describe('tokenCentricImage', () => {
    it('returns the relevant image path', () => {
      expect.assertions(1)
      expect(
        Asset.tokenCentricImage({
          base: 'host',
          address: 'address',
          tokenId: '42',
        })
      ).toEqual('host/address/metadata/42')
    })
  })
  describe('ticketsBannerImage', () => {
    it('returns the relevant image path', () => {
      expect.assertions(1)
      expect(
        Asset.ticketsBannerImage({
          base: 'host',
          address: 'address',
        })
      ).toEqual('host/address/tickets/banner')
    })
  })
})
