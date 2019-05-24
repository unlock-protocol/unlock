import {
  get,
  put,
  clear,
  storageId,
  addListener,
  removeListener,
  getAccount,
  setAccount,
  setNetwork,
  getNetwork,
} from '../../../data-iframe/cache'

jest.mock('../../../utils/localStorage', () => () => true)

describe('localStorage cache', () => {
  const nullAccount = '0x0000000000000000000000000000000000000000'
  let fakeWindow
  function makeWindow() {
    fakeWindow = {
      storage: {},
      localStorage: {
        getItem: jest.fn(key => fakeWindow.storage[key]),
        setItem: jest.fn((key, value) => {
          if (typeof value !== 'string') {
            throw new Error('localStorage only supports strings')
          }
          fakeWindow.storage[key] = value
        }),
        removeItem: jest.fn(key => {
          delete fakeWindow.storage[key]
        }),
      },
    }
  }

  describe('get', () => {
    beforeEach(() => {
      makeWindow()
    })

    it('value is not yet set', async () => {
      expect.assertions(1)

      expect(
        await get({
          window: fakeWindow,
          networkId: 123,
          type: 'there',
          accountAddress: 'hi',
        })
      ).toBeNull()
    })

    it('value is set', async () => {
      expect.assertions(1)
      fakeWindow.storage[storageId(123, 'hi', 'there')] = JSON.stringify(
        'hello'
      )

      expect(
        await get({
          window: fakeWindow,
          networkId: 123,
          type: 'there',
          accountAddress: 'hi',
        })
      ).toBe('hello')
    })

    it('no account retrieves generic value', async () => {
      expect.assertions(1)
      fakeWindow.storage[storageId(123, nullAccount, 'there')] = JSON.stringify(
        'hello'
      )

      expect(
        await get({
          window: fakeWindow,
          networkId: 123,
          type: 'there',
        })
      ).toBe('hello')
    })

    it('value is set, but malformed', async () => {
      expect.assertions(1)
      fakeWindow.storage[storageId(123, 'hi', 'there')] = JSON.stringify(
        'hello'
      ).substring(1, 4)

      expect(
        await get({
          window: fakeWindow,
          networkId: 123,
          type: 'there',
          accountAddress: 'hi',
        })
      ).toBeNull()
    })

    it('value is set, different network', async () => {
      expect.assertions(1)
      fakeWindow.storage[storageId(456, 'hi', 'there')] = JSON.stringify(
        'hello'
      )

      expect(
        await get({
          window: fakeWindow,
          networkId: 123,
          type: 'there',
          accountAddress: 'hi',
        })
      ).toBeNull()
    })

    it('value is set, different account', async () => {
      expect.assertions(1)
      fakeWindow.storage[storageId(123, 'another', 'there')] = JSON.stringify(
        'hello'
      )

      expect(
        await get({
          window: fakeWindow,
          networkId: 123,
          type: 'there',
          accountAddress: 'hi',
        })
      ).toBeNull()
    })
  })

  describe('put', () => {
    beforeEach(() => {
      makeWindow()
    })

    it('saves the value', async () => {
      expect.assertions(1)

      await put({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'there',
        value: 'hello',
      })

      expect(fakeWindow.storage[storageId(123, 'hi', 'there')]).toBe(
        JSON.stringify('hello')
      )
    })

    it('saves the value in generic storage if no account is specified', async () => {
      expect.assertions(1)

      await put({
        window: fakeWindow,
        networkId: 123,
        type: 'there',
        value: 'hello',
      })

      expect(fakeWindow.storage[storageId(123, nullAccount, 'there')]).toBe(
        JSON.stringify('hello')
      )
    })
  })

  describe('clear', () => {
    beforeEach(async () => {
      makeWindow()
      await put({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'foo',
        value: 'bar',
      })
      await put({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bar',
        type: 'foo',
        value: 'bar',
      })
      await put({
        window: fakeWindow,
        networkId: 456,
        accountAddress: 'hi',
        type: 'foo',
        value: 'bar',
      })
      await put({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'bar',
        value: 'bar',
      })
      await put({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bar',
        type: 'fooe',
        value: 'bare',
      })
      await put({
        window: fakeWindow,
        networkId: 456,
        accountAddress: 'bar',
        type: 'fooe',
        value: 'bare',
      })
      await put({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bar',
        type: 'bare',
        value: 'bare',
      })
    })

    it('initial value is correct', () => {
      expect.assertions(1)

      expect(fakeWindow.storage).toEqual({
        'unlock-protocol/123/bar#fooe': '"bare"',
        'unlock-protocol/123/bar#bare': '"bare"',
        'unlock-protocol/123/hi#foo': '"bar"',
        'unlock-protocol/123/bar#foo': '"bar"',
        'unlock-protocol/123/hi#bar': '"bar"',
        'unlock-protocol/456/bar#fooe': '"bare"',
        'unlock-protocol/456/hi#foo': '"bar"',
      })
    })

    it('clearing just one value of the cache', async () => {
      expect.assertions(2)

      await clear({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'foo',
      })

      expect(fakeWindow.storage).toEqual({
        'unlock-protocol/123/bar#fooe': '"bare"',
        'unlock-protocol/123/bar#bare': '"bare"',
        'unlock-protocol/123/hi#bar': '"bar"',
        'unlock-protocol/123/bar#foo': '"bar"',
        'unlock-protocol/456/bar#fooe': '"bare"',
        'unlock-protocol/456/hi#foo': '"bar"',
      })

      await clear({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'bar',
      })

      expect(fakeWindow.storage).toEqual({
        'unlock-protocol/123/bar#fooe': '"bare"',
        'unlock-protocol/123/bar#bare': '"bare"',
        'unlock-protocol/123/bar#foo': '"bar"',
        'unlock-protocol/456/bar#fooe': '"bare"',
        'unlock-protocol/456/hi#foo': '"bar"',
      })
    })

    it("does not clear other user's cache", async () => {
      expect.assertions(1)

      await clear({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'foo',
      })
      const bare = await get({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bar',
        type: 'foo',
      })

      expect(bare).toBe('bar')
    })

    it("does not clear same user's cache on a different network", async () => {
      expect.assertions(2)

      await clear({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'foo',
      })
      const other = await get({
        window: fakeWindow,
        networkId: 456,
        accountAddress: 'hi',
        type: 'foo',
      })
      const mine = await get({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        type: 'foo',
      })

      expect(mine).toBeNull()
      expect(other).toBe('bar')
    })
  })

  describe('direct access', () => {
    beforeEach(() => {
      makeWindow()
    })

    it('getAccount', async () => {
      expect.assertions(1)

      await setAccount(fakeWindow, 'hi')

      const account = await getAccount(fakeWindow)
      expect(account).toBe('hi')
    })

    it('getNetwork', async () => {
      expect.assertions(1)

      await setNetwork(fakeWindow, 3)

      const network = await getNetwork(fakeWindow)

      expect(network).toBe(3)
    })

    it('setNetwork', async () => {
      expect.assertions(1)

      await setNetwork(fakeWindow, 3)

      expect(fakeWindow.storage).toEqual({
        '__unlockProtocol.network': '3',
      })
    })

    it('setAccount', async () => {
      expect.assertions(1)

      await setAccount(fakeWindow, 'hi')

      expect(fakeWindow.storage).toEqual({
        '__unlockProtocol.account': 'hi',
      })
    })
  })

  describe('addListener', () => {
    let fakeWindow
    let listeners
    beforeEach(() => {
      listeners = {}
      fakeWindow = {
        addEventListener: (message, listener) => {
          listeners[message] = listeners[message] || new Map()
          listeners[message].set(listener, listener)
        },
        removeEventListener: (message, listener) => {
          listeners[message] = listeners[message] || new Map()
          listeners[message].delete(listener)
        },
      }
    })

    it('adds a listener for a user on a network', async () => {
      expect.assertions(2)
      const listen = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(1)

      for (let [listener] of listeners.storage) {
        listener({
          key: 'unlock-protocol/123/hi',
          oldValue: 'bye',
          newValue: 'hi',
        })
      }
      expect(listen).toHaveBeenCalledWith('bye', 'hi')
    })

    it('clears prior listeners', async () => {
      expect.assertions(1)
      const listen = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(1)
    })

    it('does not affect listeners on a different network, same user', async () => {
      expect.assertions(3)
      const listen = jest.fn()
      const listen2 = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      await addListener({
        window: fakeWindow,
        networkId: 456,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(2)

      for (let [listener] of listeners.storage) {
        listener({
          key: 'unlock-protocol/123/hi',
          oldValue: 'bye',
          newValue: 'hi',
        })
      }

      expect(listen).toHaveBeenCalled()
      expect(listen2).not.toHaveBeenCalled()
    })

    it('does not affect listeners for a different user, same network', async () => {
      expect.assertions(3)
      const listen = jest.fn()
      const listen2 = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bye',
        changeCallback: listen2,
      })

      expect(listeners.storage.size).toBe(2)

      for (let [listener] of listeners.storage) {
        listener({
          key: 'unlock-protocol/123/hi',
          oldValue: 'bye',
          newValue: 'hi',
        })
      }

      expect(listen).toHaveBeenCalled()
      expect(listen2).not.toHaveBeenCalled()
    })
  })

  describe('removeListener', () => {
    let fakeWindow
    let listeners
    beforeEach(() => {
      listeners = {}
      fakeWindow = {
        addEventListener: (message, listener) => {
          listeners[message] = listeners[message] || new Map()
          listeners[message].set(listener, listener)
        },
        removeEventListener: (message, listener) => {
          listeners[message] = listeners[message] || new Map()
          listeners[message].delete(listener)
        },
      }
    })

    it('removes a listener for a user on a network', async () => {
      expect.assertions(2)
      const listen = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(1)

      await removeListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(0)
    })

    it('does not remove a listener for the same user on a different network', async () => {
      expect.assertions(5)
      const listen = jest.fn()
      const listen2 = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      await addListener({
        window: fakeWindow,
        networkId: 456,
        accountAddress: 'hi',
        changeCallback: listen2,
      })

      expect(listeners.storage.size).toBe(2)

      await removeListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(1)

      for (let [listener] of listeners.storage) {
        listener({
          key: 'unlock-protocol/123/hi',
          oldValue: 'bye',
          newValue: 'hi',
        })
      }

      expect(listen).not.toHaveBeenCalled()
      expect(listen2).not.toHaveBeenCalled()

      await removeListener({
        window: fakeWindow,
        networkId: 456,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(0)
    })

    it('does not remove a listener for the same network, different user', async () => {
      expect.assertions(5)
      const listen = jest.fn()
      const listen2 = jest.fn()

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      await addListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bye',
        changeCallback: listen2,
      })

      expect(listeners.storage.size).toBe(2)

      await removeListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'hi',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(1)

      for (let [listener] of listeners.storage) {
        listener({
          key: 'unlock-protocol/123/hi',
          oldValue: 'bye',
          newValue: 'hi',
        })
      }

      expect(listen).not.toHaveBeenCalled()
      expect(listen2).not.toHaveBeenCalled()

      await removeListener({
        window: fakeWindow,
        networkId: 123,
        accountAddress: 'bye',
        changeCallback: listen,
      })

      expect(listeners.storage.size).toBe(0)
    })
  })
})
