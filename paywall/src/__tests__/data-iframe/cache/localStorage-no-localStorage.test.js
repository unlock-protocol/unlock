import {
  get,
  put,
  clear,
  getAccount,
  setAccount,
  getNetwork,
  setNetwork,
} from '../../../data-iframe/cache'

jest.mock('../../../utils/localStorage', () => () => false)

describe('localStorage cache', () => {
  describe('localStorage unavailable', () => {
    it('get', async () => {
      expect.assertions(1)

      try {
        await get({ type: 'thing' })
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot get thing from cache'
        )
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
        await put({ type: 'thing' })
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save thing in cache'
        )
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
        await clear({})
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot clear cache'
        )
      }
    })

    it('getAccount', async () => {
      expect.assertions(1)

      try {
        await getAccount()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot get account from cache'
        )
      }
    })

    it('getNetwork', async () => {
      expect.assertions(1)

      try {
        await getNetwork()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot get network from cache'
        )
      }
    })

    it('setAccount', async () => {
      expect.assertions(1)

      try {
        await setAccount()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save account in cache'
        )
      }
    })

    it('setNetwork', async () => {
      expect.assertions(1)

      try {
        await setNetwork()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save network in cache'
        )
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
