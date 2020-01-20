import * as GeneratekeyMetadata from '../src/generateKeyMetadata'

describe('generateKeyMetadata', () => {
  describe('when on chain metadata doesnt exist', () => {
    it('returns an empty collection', async () => {
      expect.assertions(1)
      jest
        .spyOn(GeneratekeyMetadata, 'fetchChainData')
        .mockResolvedValueOnce({})
      expect(
        await GeneratekeyMetadata.generateKeyMetadata(
          'testAddress',
          'testkeyId'
        )
      ).toEqual({})
    })
  })

  describe('when onchain metadata exists', () => {
    it('returns the metadata', async () => {
      expect.assertions(1)
      jest
        .spyOn(GeneratekeyMetadata, 'fetchChainData')
        .mockResolvedValueOnce({ value: true })

      jest
        .spyOn(GeneratekeyMetadata, 'handleValidKey')
        .mockResolvedValueOnce({ data: 'valid' })
      expect(
        await GeneratekeyMetadata.generateKeyMetadata(
          'successfulTestAddress',
          'successfulTestkeyId'
        )
      ).toEqual({
        data: 'valid',
      })
    })
  })
})
