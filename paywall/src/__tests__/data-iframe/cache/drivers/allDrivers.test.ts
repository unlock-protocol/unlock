import LocalStorageDriver from '../../../../data-iframe/cache/drivers/localStorage'
import InMemoryDriver from '../../../../data-iframe/cache/drivers/memory'
import CacheDriver from '../../../../data-iframe/cache/drivers/driverInterface'
import { LocalStorageWindow } from '../../../../windowTypes'
import { waitFor } from '../../../../utils/promises'

describe('common functionality between all drivers', () => {
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

  type eachThing = Array<[string, CacheDriver]>
  const theEach: eachThing = [
    ['localStorage', new LocalStorageDriver(fakeWindow)],
    ['memory', new InMemoryDriver()],
  ]
  describe.each(theEach)('%s driver', (_, driver) => {
    function clearCache() {
      storage = {}
      if (driver.__clear) driver.__clear()
    }

    it('should eventually be ready', async () => {
      expect.assertions(0)

      await waitFor(() => driver.ready())
    })

    describe('getKeyedItem/saveKeyedItem', () => {
      beforeEach(() => {
        clearCache()
      })

      it('should save/retrieve items for the same account/same network', async () => {
        expect.assertions(3)
        await driver.saveKeyedItem(1, 'hi', '1-hi')
        await driver.saveKeyedItem(2, 'hi', '2-hi')
        await driver.saveKeyedItem(1, 'another', '1-another')
        const test1hi = await driver.getKeyedItem(1, 'hi')
        const test2hi = await driver.getKeyedItem(2, 'hi')
        const test1another = await driver.getKeyedItem(1, 'another')

        expect(test1hi).toBe('1-hi')
        expect(test2hi).toBe('2-hi')
        expect(test1another).toBe('1-another')
      })

      it('should save/retrieve items with their original type', async () => {
        expect.assertions(4)

        await driver.saveKeyedItem(1, '1', 3)
        await driver.saveKeyedItem(1, '2', { hi: 'there' })
        await driver.saveKeyedItem(1, '3', [1, '2'])
        await driver.saveKeyedItem(1, '4', 'string')

        const test1 = await driver.getKeyedItem(1, '1')
        const test2 = await driver.getKeyedItem(1, '2')
        const test3 = await driver.getKeyedItem(1, '3')
        const test4 = await driver.getKeyedItem(1, '4')

        expect(test1).toBe(3)
        expect(test2).toEqual({ hi: 'there' })
        expect(test3).toEqual([1, '2'])
        expect(test4).toBe('string')
      })

      it('should not retrieve items for the different account/same network', async () => {
        expect.assertions(1)
        await driver.saveKeyedItem(1, 'hi', '1-hi')
        const test1another = await driver.getKeyedItem(1, 'another')

        expect(test1another).toBeNull()
      })

      it('should not retrieve items for the different network/same account', async () => {
        expect.assertions(1)
        await driver.saveKeyedItem(1, 'hi', '1-hi')
        const test2hi = await driver.getKeyedItem(2, 'hi')

        expect(test2hi).toBeNull()
      })
    })

    describe('getUnkeyedItem/saveUnkeyedItem', () => {
      beforeEach(() => {
        clearCache()
      })

      it('should save/retrieve items', async () => {
        expect.assertions(3)

        await driver.saveUnkeyedItem('account', 'account')
        await driver.saveUnkeyedItem('network', 1)
        await driver.saveUnkeyedItem('balance', '0')

        const account = await driver.getUnkeyedItem('account')
        const network = await driver.getUnkeyedItem('network')
        const balance = await driver.getUnkeyedItem('balance')

        expect(account).toBe('account')
        expect(network).toBe(1)
        expect(balance).toBe('0')
      })
    })

    describe('clearKeyedCache', () => {
      beforeEach(() => {
        clearCache()
      })

      it('should clear cache for the same account/network', async () => {
        expect.assertions(1)

        await driver.saveKeyedItem(1, 'hi', 'there')
        await driver.clearKeyedCache(1, 'hi')

        const test = await driver.getKeyedItem(1, 'hi')

        expect(test).toBeNull()
      })

      it('should not clear cache for the different account/same network', async () => {
        expect.assertions(2)

        await driver.saveKeyedItem(1, 'hi', 'there')
        await driver.saveKeyedItem(1, 'another', 'another')
        await driver.clearKeyedCache(1, 'hi')

        const test1hi = await driver.getKeyedItem(1, 'hi')
        const test1another = await driver.getKeyedItem(1, 'another')

        expect(test1hi).toBeNull()
        expect(test1another).toBe('another')
      })

      it('should not clear cache for the different network/same account', async () => {
        expect.assertions(2)

        await driver.saveKeyedItem(1, 'hi', 'there')
        await driver.saveKeyedItem(2, 'hi', 'another')
        await driver.clearKeyedCache(1, 'hi')

        const test1hi = await driver.getKeyedItem(1, 'hi')
        const test2hi = await driver.getKeyedItem(2, 'hi')

        expect(test1hi).toBeNull()
        expect(test2hi).toBe('another')
      })
    })
  })
})
