import { vi } from 'vitest'
import KeyData from '../../src/utils/keyData'

vi.mock('@unlock-protocol/unlock-js', () => ({
  SubgraphService: vi.fn(),
}))

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

    describe('when the data has a referrer', () => {
      it('adds a refer attribute', () => {
        expect.assertions(1)
        expect(
          keyData.openSeaPresentation({
            referrer: '0x0000000000000000000000000000000000000123',
          })
        ).toEqual({
          attributes: [
            {
              display_type: 'string',
              trait_type: 'refer',
              value: '0x0000000000000000000000000000000000000123',
            },
          ],
        })
      })
    })
  })
})
