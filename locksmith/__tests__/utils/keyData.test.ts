import KeyData from '../../src/utils/keyData'

describe('KeyData', () => {
  let keyData = new KeyData('http://someprovider')

  describe('openSeaPresentation', () => {
    describe('when the data has an expiration', () => {
      it('returns the data structured for OpenSea', () => {
        expect.assertions(1)
        expect(keyData.openSeaPresentation({ expiration: 1234 })).toEqual({
          attributes: [
            {
              display_type: 'number',
              trait_type: 'expiration',
              value: 1234,
            },
          ],
        })
      })
    })

    describe('when the data is missing an expiration', () => {
      it('passes the data through', () => {
        expect.assertions(1)
        expect(keyData.openSeaPresentation({})).toEqual({})
      })
    })
  })
})
