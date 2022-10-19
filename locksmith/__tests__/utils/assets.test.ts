import * as Asset from '../../src/utils/assets'

let returnStatus = { statusCode: 200 }

vi.mock('request-promise-native', () => {
  return vi.fn(() => {
    return {
      default: returnStatus,
    }
  })
})

describe('Assets', () => {
  describe('exists', () => {
    describe('when the asset exists', () => {
      it('returns true', async () => {
        expect.assertions(1)
        expect(await Asset.exists('existing_image')).toBe(true)
      })
    })

    describe('when the asset does not exist', () => {
      it('returns false', async () => {
        expect.assertions(1)
        returnStatus = { statusCode: 403 }
        expect(await Asset.exists('non_existing_image')).toBe(false)
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
          tokenId: 42,
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
