import { Forage, Usage } from '../../src/utils/forage'

describe('Forage', () => {
  describe("when searching for an event's banner image", () => {
    it('returns the appropriate image', () => {
      expect.assertions(1)
      let forage = new Forage()
      let output = forage.locate(Usage.TicketBanner, { address: '0xabc' })
      expect(output).toEqual('0xabc/tickets/banner')
    })
  })

  describe("when searching for a token's default image", () => {
    it('returns the path of the image', () => {
      expect.assertions(1)
      let forage = new Forage()
      let output = forage.locate(Usage.TokenDefaultImage, { address: '0xabc' })
      expect(output).toEqual('0xabc/metadata/default_image')
    })
  })

  describe('when searching for a token specific image', () => {
    it('returns the path of the image', () => {
      expect.assertions(1)
      let forage = new Forage()
      let output = forage.locate(Usage.TokenSpecificImage, {
        address: '0xabc',
        tokenId: 223,
      })
      expect(output).toEqual('0xabc/metadata/223')
    })
  })
})
