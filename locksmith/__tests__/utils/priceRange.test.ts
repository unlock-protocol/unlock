import * as PriceRange from '../../src/utils/priceRange'

describe('PriceRange', () => {
  describe('within', () => {
    describe('when the requested price is within the acceptable range', () => {
      it('returns true', () => {
        expect.assertions(1)
        expect(PriceRange.within({ requestPrice: 5, currentPrice: 5 })).toBe(
          true
        )
      })
    })
    describe('when the requested price is outside of the acceptable range', () => {
      it('returns false', () => {
        expect.assertions(1)
        expect(PriceRange.within({ requestPrice: 5, currentPrice: 100 })).toBe(
          false
        )
      })
    })
  })
})
