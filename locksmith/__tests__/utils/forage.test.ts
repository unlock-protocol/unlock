import Forage from '../../src/utils/forage'

describe('Forage', () => {
  describe('ticketsBannerImage', () => {
    it('returns the appropriate image', () => {
      expect.assertions(1)
      let forage = new Forage()
      let output = forage.ticketsBannerImage({ address: '0xabc' })
      expect(output).toEqual('0xabc/tickets/banner')
    })
  })

  describe('tokenMetadataDefaultImage', () => {
    it('returns the path of the image', () => {
      expect.assertions(1)
      let forage = new Forage()
      let output = forage.tokenMetadataDefaultImage({ address: '0xabc' })
      expect(output).toEqual('0xabc/metadata/default_image')
    })
  })

  describe('tokenCentricImage', () => {
    it('returns the path of the image', () => {
      expect.assertions(1)
      let forage = new Forage()
      let output = forage.tokenCentricImage({
        address: '0xabc',
        tokenId: 223,
      })
      expect(output).toEqual('0xabc/metadata/223')
    })
  })
})
