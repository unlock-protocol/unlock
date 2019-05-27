import {
  get,
  put,
  clear,
  getAccount,
  setAccount,
  getNetwork,
  setNetwork,
} from '../../../data-iframe/cache'
import { merge } from '../../../data-iframe/cache/localStorage'

jest.mock('../../../utils/localStorage', () => () => false)

describe('localStorage cache', () => {
  describe('localStorage unavailable', () => {
    it('should throw when get is called', async () => {
      expect.assertions(1)

      try {
        await get({ type: 'thing' })
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot get thing from cache'
        )
      }
    })

    it('should throw when put is called', async () => {
      expect.assertions(1)

      try {
        await put({ type: 'thing' })
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save thing in cache'
        )
      }
    })

    it('should throw when merge is called', async () => {
      expect.assertions(1)

      try {
        await merge({ type: 'thing', subType: 'another' })
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save thing/another in cache'
        )
      }
    })

    it('should throw when clear is called', async () => {
      expect.assertions(1)

      try {
        await clear({})
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot clear cache'
        )
      }
    })

    it('should throw when getAccount is called', async () => {
      expect.assertions(1)

      try {
        await getAccount()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot get account from cache'
        )
      }
    })

    it('should throw when getNetwork is called', async () => {
      expect.assertions(1)

      try {
        await getNetwork()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot get network from cache'
        )
      }
    })

    it('should throw when setAccount is called', async () => {
      expect.assertions(1)

      try {
        await setAccount()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save account in cache'
        )
      }
    })

    it('should throw when setNetwork is called', async () => {
      expect.assertions(1)

      try {
        await setNetwork()
      } catch (e) {
        expect(e.message).toBe(
          'localStorage is unavailable, cannot save network in cache'
        )
      }
    })
  })
})
