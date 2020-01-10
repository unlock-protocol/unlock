import UnlockJs from '@unlock-protocol/unlock-js'
import EventEmitter from 'events'
import web3Middleware from '../../middlewares/web3Middleware'
import { UPDATE_ACCOUNT } from '../../actions/accounts'
import { ADD_LOCK, UPDATE_LOCK } from '../../actions/lock'
import { SET_ERROR } from '../../actions/error'
import configure from '../../config'

import { success } from '../../services/storageService'

/**
 * Fake state
 */
let account = {
  address: '0xabc',
}
let lock = {
  address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  keyPrice: '100',
  owner: account,
}
let state = {}

let key

const network = {
  name: 'test',
}

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */
const create = () => {
  const config = configure()
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()

  const handler = web3Middleware(config)(store)

  const invoke = action => handler(next)(action)

  return { next, invoke, store }
}

/**
 * Mocking web3Service
 * Default objects yielded by promises
 */
class MockWebService extends EventEmitter {
  constructor() {
    super()
    this.ready = true
  }
}

let mockWeb3Service = new MockWebService()

jest.mock('@unlock-protocol/unlock-js', () => {
  const mockUnlock = require.requireActual('@unlock-protocol/unlock-js') // Original module
  return {
    ...mockUnlock,
    Web3Service() {
      return mockWeb3Service
    },
  }
})
UnlockJs.mockImplementation = MockWebService

class MockStorageService extends EventEmitter {
  constructor() {
    super()
  }
}

const mockStorageService = new MockStorageService()
jest.mock('../../services/storageService.js', () => {
  return {
    success: {
      getLockAddressesForUser: 'getLockAddressesForUser.success',
    },
    StorageService() {
      return mockStorageService
    },
  }
})

beforeEach(() => {
  // Reset the mock
  mockWeb3Service = new MockWebService()
  mockWeb3Service = new MockStorageService()
  mockStorageService.getLockAddressesForUser = jest.fn(() =>
    Promise.resolve([])
  )

  // Reset state!
  account = {
    address: '0xabc',
  }
  lock = {
    address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    keyPrice: '100',
    owner: account.address,
  }
  key = {
    id: `${lock.address}-${account.address}`,
    lock: lock.address,
    owner: account.address,
    expiration: 0,
    data: null,
  }
  state = {
    router: {
      location: {
        pathname: '/dashboard',
        hash: '',
      },
    },
    account,
    network,
    provider: 'HTTP',
    locks: {
      [lock.address]: lock,
    },
    transactions: {},
    keys: {
      [key.id]: key,
    },
  }
})

describe('Web3 middleware', () => {
  describe('success.getLockAddressesForUser', () => {
    it('should get all of the locks returned', () => {
      expect.assertions(2)
      create()
      const lockAddresses = ['0xa', '0xb']
      mockWeb3Service.getLock = jest.fn()
      mockStorageService.emit(success.getLockAddressesForUser, lockAddresses)
      expect(mockWeb3Service.getLock).toHaveBeenNthCalledWith(1, '0xa')
      expect(mockWeb3Service.getLock).toHaveBeenNthCalledWith(2, '0xb')
    })
  })

  describe('lock.updated events triggered by the web3Service', () => {
    it('should dispatch addLock if the lock does not exist yet', () => {
      expect.assertions(1)
      const { store } = create()
      const address = '0x123'
      const update = {
        name: 'My Lock',
      }
      mockWeb3Service.emit('lock.updated', address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ADD_LOCK,
          address,
          lock: update,
        })
      )
    })

    it('should dispatch updateLock if the lock does already exist', () => {
      expect.assertions(1)
      const { store } = create()
      const update = {
        name: 'My Lock',
      }
      mockWeb3Service.emit('lock.updated', lock.address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UPDATE_LOCK,
          address: lock.address,
          update,
        })
      )
    })
  })

  it('should handle account.updated events triggered by the web3Service', () => {
    expect.assertions(1)
    const { store } = create()
    const account = {}
    const update = {
      balance: 1337,
    }
    mockWeb3Service.emit('account.updated', account, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_ACCOUNT,
        update,
      })
    )
  })

  describe('error events triggered by the web3Service', () => {
    it('it should handle error events triggered by the web3Service', () => {
      expect.assertions(1)
      const { store } = create()
      mockWeb3Service.emit('error', { message: 'this was broken' })
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SET_ERROR,
          error: 'this was broken',
        })
      )
    })
  })
})
