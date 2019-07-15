import LocalStorageDriver, {
  currentCacheVersion,
} from '../../../../data-iframe/cache/drivers/localStorage'
import { LocalStorageWindow } from '../../../../windowTypes'
import { waitFor } from '../../../../utils/promises'

describe('localStorage-specific behavior', () => {
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

  beforeEach(() => {
    storage = {}
  })

  it('should clear old cache if version is not present', async () => {
    expect.assertions(1)

    storage = {
      somekey: 'is set and should be cleared',
    }

    const cache = new LocalStorageDriver(fakeWindow)

    await waitFor(() => cache.ready())
    expect(storage).toEqual({
      '__unlockProtocol.__version': JSON.stringify(currentCacheVersion),
    })
  })

  it('should clear cache if version does not match', async () => {
    expect.assertions(1)

    storage = {
      // set to a value that we will never use
      '__unlockProtocol.__version':
        '@#!*&($^(*#!@^$(*!^$&(*!@#$&^*(!@&$^(*!@&$^',
      '__unlockProtocol.account': 'hi',
    }

    const cache = new LocalStorageDriver(fakeWindow)

    await waitFor(() => cache.ready())
    const savedAccount = await cache.getUnkeyedItem('account')

    expect(savedAccount).toBeNull()
  })

  it('should not clear cache if version matches', async () => {
    expect.assertions(1)

    const cache1 = new LocalStorageDriver(fakeWindow)

    await waitFor(() => cache1.ready())
    cache1.saveUnkeyedItem('account', 'hi')
    const cache2 = new LocalStorageDriver(fakeWindow)

    await waitFor(() => cache2.ready())

    const savedAccount = await cache2.getUnkeyedItem('account')

    expect(savedAccount).toBe('hi')
  })
})
