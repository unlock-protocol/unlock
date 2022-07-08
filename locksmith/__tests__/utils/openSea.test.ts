import { generateOpenSeaUrl } from '../../src/utils/openSea'

describe('OpenSeaHelper', () => {
  describe('generate url ', () => {
    it('returns a correct url for test network', () => {
      expect.assertions(1)
      const url = generateOpenSeaUrl({
        lockAddress: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        tokenId: '1',
        network: 4,
      })
      expect(url).toBe(
        'https://testnets.opensea.io/assets/0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2/1'
      )
    })

    it('returns a corrent url for mainnet network', () => {
      expect.assertions(1)
      const url = generateOpenSeaUrl({
        lockAddress: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        tokenId: '1',
        network: 1,
      })
      expect(url).toBe(
        'https://opensea.io/assets/0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2/1'
      )
    })

    it('returns a undefined when network is not a valid value', () => {
      expect.assertions(1)
      const url = generateOpenSeaUrl({
        lockAddress: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        tokenId: '1',
        network: 8292,
      })
      expect(url).toBe(undefined)
    })
  })
})
