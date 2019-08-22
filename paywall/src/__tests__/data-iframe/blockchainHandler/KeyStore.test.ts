import KeyStore from '../../../data-iframe/blockchainHandler/KeyStore'
import { KeyResult } from '../../../data-iframe/blockchainHandler/blockChainTypes'

let store: KeyStore
let signal = jest.fn()

const lockAddresses = ['0x123abc', '0xabc123']

const aKey: KeyResult = {
  lock: lockAddresses[0],
  owner: '0xfeedbeef',
  expiration: 1234567890,
}

const anotherKey: KeyResult = {
  lock: lockAddresses[1],
  owner: '0xfeedbeef',
  expiration: 1234567890,
}

describe('KeyStore', () => {
  describe('constructor', () => {
    it('should start out with all null keys in the store', () => {
      expect.assertions(2)
      store = new KeyStore(lockAddresses)
      lockAddresses.forEach(lockAddress => {
        expect(store.keys[lockAddress]).toBeNull()
      })
    })
  })

  describe('addKey', () => {
    beforeAll(() => {
      store = new KeyStore(lockAddresses)
    })

    it('should add a key', () => {
      expect.assertions(1)

      store.addKey(aKey)
      expect(store.keys[aKey.lock]).toEqual(aKey)
    })

    it('should add another key', () => {
      expect.assertions(2)

      store.addKey(anotherKey)
      expect(store.keys[aKey.lock]).toEqual(aKey) // still have it!
      expect(store.keys[anotherKey.lock]).toEqual(anotherKey)
    })
  })

  describe('emitValidKeys', () => {
    beforeAll(() => {
      store = new KeyStore(lockAddresses)
      signal = jest.fn()
      store.on('keyStore.validKeys', () => {
        signal()
      })
    })

    it('should only emit when the number of keys matches the number of locks', () => {
      expect.assertions(2)

      store.addKey(aKey)
      expect(signal).not.toHaveBeenCalled()

      store.addKey(anotherKey)
      expect(signal).toHaveBeenCalledWith()
    })
  })
})
