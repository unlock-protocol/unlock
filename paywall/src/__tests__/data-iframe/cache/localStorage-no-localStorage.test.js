import {
  get,
  put,
  clear,
  getAccount,
  setAccount,
  getNetwork,
  setNetwork,
  getReadOnly,
  putReadOnly,
} from '../../../data-iframe/cache'

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

    it('getReadOnly', async () => {
      expect.assertions(1)

      try {
        await getReadOnly()
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

    it('putReadOnly', async () => {
      expect.assertions(1)

      try {
        await putReadOnly()
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

    it('getAccount', async () => {
      expect.assertions(1)

      try {
        await getAccount()
      } catch (e) {
        expect(e.message).toBe('Cannot get value from localStorage')
      }
    })

    it('getNetwork', async () => {
      expect.assertions(1)

      try {
        await getNetwork()
      } catch (e) {
        expect(e.message).toBe('Cannot get value from localStorage')
      }
    })

    it('setAccount', async () => {
      expect.assertions(1)

      try {
        await setAccount()
      } catch (e) {
        expect(e.message).toBe('Cannot put value into localStorage')
      }
    })

    it('setNetwork', async () => {
      expect.assertions(1)

      try {
        await setNetwork()
      } catch (e) {
        expect(e.message).toBe('Cannot put value into localStorage')
      }
    })
  })
})
