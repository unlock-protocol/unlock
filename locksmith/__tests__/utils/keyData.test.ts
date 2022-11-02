import KeyData from '../../src/utils/keyData'

describe('KeyData', () => {
  const keyData = new KeyData()

  describe('openSeaPresentation', () => {
    describe('when the data has an expiration', () => {
      it('returns the data structured for OpenSea', () => {
        expect.assertions(1)
        expect(keyData.openSeaPresentation({ expiration: 1234 })).toEqual({
          attributes: [
            {
              display_type: 'date',
              trait_type: 'Expiration',
              value: 1234,
            },
          ],
        })
      })
    })

    describe('when the data is missing an expiration', () => {
      it('passes the data through', () => {
        expect.assertions(1)
        expect(keyData.openSeaPresentation({})).toEqual({
          attributes: [],
        })
      })
    })
  })
})
