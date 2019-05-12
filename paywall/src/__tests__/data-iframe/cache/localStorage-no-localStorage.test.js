import { get, put, clear } from '../../../data-iframe/cache'

jest.mock('../../../utils/localStorage', () => () => false)

describe('localStorage cache', () => {
  describe('localStorage unavailable', () => {
    it('get', async () => {
      expect.assertions(1)

      try {
        await get()
      } catch (e) {
        expect(e.message).toBe('Cannot get value from localStorage')
      }
    })

    it('put', async () => {
      expect.assertions(1)

      try {
        await put()
      } catch (e) {
        expect(e.message).toBe('Cannot put value into localStorage')
      }
    })

    it('clear', async () => {
      expect.assertions(1)

      try {
        await clear()
      } catch (e) {
        expect(e.message).toBe('Cannot clear localStorage cache')
      }
    })
  })
})
