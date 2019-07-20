import { LocalStorageWindow } from '../../../windowTypes'
import {
  __clearDriver,
  get,
  put,
  merge,
  getAccount,
  setAccount,
  setNetwork,
  getNetwork,
  clear,
  setLocks,
  getLocks,
} from '../../../data-iframe/cache/cache'

describe('cache utility', () => {
  let storage: any = {}
  const fakeWindow: LocalStorageWindow = {
    localStorage: {
      length: 1,
      clear: () => {
        storage = {}
      },
      getItem(key: string) {
        return storage[key] || null
      },
      key(_: number) {
        return '' // unused but required for the interface
      },
      removeItem(key: string) {
        delete storage[key]
      },
      setItem(key: string, value: string) {
        storage[key] = value
      },
    },
  }
  const fakeWindowNoLocalStorage: LocalStorageWindow = {
    localStorage: {
      length: 0,
      clear: () => {
        storage = {}
      },
      getItem(key: string) {
        return storage[key] || null
      },
      key(_: number) {
        return '' // unused but required for the interface
      },
      removeItem(key: string) {
        delete storage[key]
      },
      setItem(key: string, value: string) {
        storage[key] = value
        throw new Error('no local storage available')
      },
    },
  }

  type eachThing = Array<[string, LocalStorageWindow]>
  const theEach: eachThing = [
    ['localStorage', fakeWindow],
    ['memory', fakeWindowNoLocalStorage],
  ]
  describe.each(theEach)('%s driver cache', (_, testWindow) => {
    function clearCache() {
      __clearDriver()
      storage = {}
    }
    beforeEach(() => {
      clearCache()
    })

    describe('get', () => {
      beforeEach(() => {
        clearCache()
      })
      it('should return {} if there is no value and no type', async () => {
        expect.assertions(1)

        const container = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        expect(container).toEqual({})
      })

      it('should return null if there is no value and a type is specified', async () => {
        expect.assertions(1)

        const container = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'there',
        })

        expect(container).toEqual(null)
      })

      it('should return value if there is a value and no type is specified', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'thing',
          value: 22,
        })

        const container = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        expect(container).toEqual({ thing: 22 })
      })

      it('should return value of type if there is a value and a type is specified', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'thing',
          value: 22,
        })

        const container = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'thing',
        })

        expect(container).toEqual(22)
      })
    })

    describe('put', () => {
      beforeEach(() => {
        clearCache()
      })

      it('should save a value if it is defined', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'type',
          value: 'value',
        })

        const testValue = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        expect(testValue).toEqual({ type: 'value' })
      })

      it('should erase a value if it is undefined', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'type',
          value: 'value',
        })

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'type',
          value: undefined,
        })

        const testValue = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        expect(testValue).toEqual({})
      })
    })

    describe('merge', () => {
      beforeEach(() => {
        clearCache()
      })

      it('should not mutate the input', async () => {
        expect.assertions(1)

        const input = {
          one: 1,
        }

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'thing',
          value: input,
        })

        await merge({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'thing',
          subType: 'two',
          value: 2,
        })

        expect(input).toEqual({
          one: 1,
        })
      })

      it('should save a sub-type value inside a larger container', async () => {
        expect.assertions(1)

        await merge({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          subType: 'lockAddress1',
          value: { address: 'lockAddress1' },
        })

        await merge({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          subType: 'lockAddress2',
          value: { address: 'lockAddress2' },
        })

        const value = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
        })

        expect(value).toEqual({
          lockAddress1: {
            address: 'lockAddress1',
          },
          lockAddress2: {
            address: 'lockAddress2',
          },
        })
      })

      it('should remove a sub-type if value is undefined inside a larger container', async () => {
        expect.assertions(1)

        await merge({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          subType: 'lockAddress1',
          value: { address: 'lockAddress1' },
        })

        await merge({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          subType: 'lockAddress2',
          value: { address: 'lockAddress2' },
        })

        await merge({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          subType: 'lockAddress2',
          value: undefined,
        })

        const value = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
        })

        expect(value).toEqual({
          lockAddress1: {
            address: 'lockAddress1',
          },
        })
      })
    })

    describe('clear', () => {
      beforeEach(() => {
        clearCache()
      })

      it('should remove a type in the cache if passed a type', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          value: { address: 'lockAddress1' },
        })

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'second',
          value: { address: 'lockAddress2' },
        })

        await clear({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
        })

        const value = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        expect(value).toEqual({
          second: { address: 'lockAddress2' },
        })
      })

      it('should remove the whole cache if not passed a type', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          value: { address: 'lockAddress1' },
        })

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'second',
          value: { address: 'lockAddress2' },
        })

        await clear({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        const value = await get({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        expect(value).toEqual({})
      })

      it('should not touch other caches', async () => {
        expect.assertions(1)

        await put({
          window: testWindow,
          networkId: 2,
          accountAddress: 'hi',
          type: 'locks',
          value: { address: 'lockAddress1' },
        })

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'locks',
          value: { address: 'lockAddress1' },
        })

        await put({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
          type: 'second',
          value: { address: 'lockAddress2' },
        })

        await clear({
          window: testWindow,
          networkId: 1,
          accountAddress: 'hi',
        })

        const otherCache = await get({
          window: testWindow,
          networkId: 2,
          accountAddress: 'hi',
        })

        expect(otherCache).toEqual({
          locks: { address: 'lockAddress1' },
        })
      })
    })

    it('should save and retrieve account', async () => {
      expect.assertions(1)

      await setAccount(testWindow, 'hi')
      const account = await getAccount(testWindow)

      expect(account).toBe('hi')
    })

    it('should save and retrieve network', async () => {
      expect.assertions(1)

      await setNetwork(testWindow, 2)
      const network = await getNetwork(testWindow)

      expect(network).toBe(2)
    })

    it('should save and retrieve locks', async () => {
      expect.assertions(1)

      const locks = {
        '0x123': {
          name: 'Big ol lock',
          address: '0x123',
          keyPrice: '1',
          expirationDuration: 123,
          currencyContractAddress: '0x345',
        },
      }
      await setLocks(testWindow, locks)
      const network = await getLocks(testWindow)

      expect(network).toBe(locks)
    })
  })
})
