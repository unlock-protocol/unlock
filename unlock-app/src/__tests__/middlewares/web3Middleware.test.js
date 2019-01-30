import EventEmitter from 'events'
import { LOCATION_CHANGE } from 'react-router-redux'
import web3Middleware from '../../middlewares/web3Middleware'
import { ADD_LOCK, LOCK_DEPLOYED, UPDATE_LOCK } from '../../actions/lock'
import { UPDATE_KEY } from '../../actions/key'
import { UPDATE_ACCOUNT } from '../../actions/accounts'
import { ADD_TRANSACTION, UPDATE_TRANSACTION } from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { SET_KEYS_ON_PAGE_FOR_LOCK } from '../../actions/keysPages'
import { PGN_ITEMS_PER_PAGE } from '../../constants'

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

const transaction = {
  hash: '0xf21e9820af34282c8bebb3a191cf615076ca06026a144c9c28e9cb762585472e',
}
const network = {
  name: 'test',
}

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */
const create = () => {
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()

  const handler = web3Middleware(store)

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

jest.mock('../../services/web3Service', () => {
  return function() {
    return mockWeb3Service
  }
})

beforeEach(() => {
  // Reset the mock
  mockWeb3Service = new MockWebService()

  // Reset state!
  account = {
    address: '0xabc',
  }
  lock = {
    address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    keyPrice: '100',
    owner: account.address,
  }
  state = {
    account,
    network,
    provider: 'HTTP',
    locks: {
      [lock.address]: lock,
    },
    transactions: {},
    keys: {},
  }
})

describe('Lock middleware', () => {
  it('should handle account.updated events triggered by the web3Service', () => {
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

  it('it should handle lock.saved events triggered by the web3Service', () => {
    expect.assertions(4)
    const { store } = create()
    const lock = {}
    const address = '0x123'
    mockWeb3Service.refreshAccountBalance = jest.fn()
    mockWeb3Service.getLock = jest.fn()
    mockWeb3Service.getPastLockTransactions = jest.fn()

    mockWeb3Service.emit('lock.saved', lock, address)
    expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
      state.account
    )
    expect(mockWeb3Service.getPastLockTransactions).toHaveBeenCalledWith(
      address
    )
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(address)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LOCK_DEPLOYED,
        lock,
        address,
      })
    )
  })

  describe('lock.updated', () => {
    it('it should dispatch UPDATE_LOCK if the lock already exists ', () => {
      const { store } = create()
      const lock = {
        address: '0x123',
      }
      state.locks = {
        [lock.address]: lock,
      }
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      const update = {}
      mockWeb3Service.emit('lock.updated', lock.address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UPDATE_LOCK,
          address: lock.address,
          update,
        })
      )
    })

    it('it should dispatch ADD_LOCK if the lock does not already exist', () => {
      expect.assertions(1)
      const { store } = create()
      const lock = {
        address: '0x123',
      }

      const update = {}
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      mockWeb3Service.emit('lock.updated', lock.address, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ADD_LOCK,
          address: lock.address,
          lock: update,
        })
      )
    })
  })

  describe('when handling the key.saved events triggered by the web3Service', () => {
    it('it should reload the lock, the account and get the corresponding key for the current user', () => {
      expect.assertions(3)
      create()

      const key = {
        id: '0xabc',
        lock: lock.address,
        owner: state.account.address,
      }
      mockWeb3Service.getLock = jest.fn()
      mockWeb3Service.refreshAccountBalance = jest.fn()
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      mockWeb3Service.emit('key.saved', '0xabc', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock.address)
      expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
        lock.address,
        state.account.address
      )
      expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
        state.account
      )
    })
  })

  describe('when handling the key.updated events triggered by the web3Service', () => {
    it('it dispatch updateKey', () => {
      expect.assertions(1)
      const { store } = create()

      const keyId = 'keyId'
      const key = {
        id: keyId,
        lock: lock.address,
      }

      state.keys = {
        [keyId]: key,
      }
      const update = {
        data: 'hello',
      }

      mockWeb3Service.emit('key.updated', keyId, update)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UPDATE_KEY,
          id: key.id,
          update,
        })
      )
    })
  })

  it('it should handle transaction.new events triggered by the web3Service', () => {
    expect.assertions(1)

    const { store } = create()
    mockWeb3Service.getTransaction = jest.fn()

    mockWeb3Service.emit('transaction.new', transaction.hash)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ADD_TRANSACTION,
        transaction,
      })
    )
  })

  it('it should handle transaction.updated events triggered by the web3Service', () => {
    const { store } = create()
    const update = {}
    mockWeb3Service.emit('transaction.updated', transaction.hash, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update,
      })
    )
  })

  describe('when receiving a keys.page event triggered by the web3Service', () => {
    it('should dispatch setKeysOnPageForLock', () => {
      const { store } = create()
      const lock = '0x123'
      const page = 1336
      const keys = []
      mockWeb3Service.emit('keys.page', lock, page, keys)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SET_KEYS_ON_PAGE_FOR_LOCK,
          page,
          lock,
          keys,
        })
      )
    })
  })

  describe('error events triggered by the web3Service', () => {
    it('it should handle error events triggered by the web3Service', () => {
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

  it("should handle LOCATION_CHANGE by calling web3Service's getLock", () => {
    const { next, invoke } = create()
    const action = {
      type: LOCATION_CHANGE,
      payload: { location: { pathname: `/lock/${lock.address}` } },
    }
    mockWeb3Service.getLock = jest.fn()
    invoke(action)
    expect(mockWeb3Service.getLock).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('SET_KEYS_ON_PAGE_FOR_LOCK', () => {
    it('should call getKeysForLockOnPage on web3Service only if the keys variable is falsy', () => {
      const { next, invoke } = create()
      const page = 1
      const action = {
        type: SET_KEYS_ON_PAGE_FOR_LOCK,
        lock: lock.address,
        page,
      }
      mockWeb3Service.getKeysForLockOnPage = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeysForLockOnPage).toHaveBeenCalledWith(
        lock.address,
        page,
        PGN_ITEMS_PER_PAGE
      )
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should not call getKeysForLockOnPage if the keys are sert', () => {
      const { next, invoke } = create()
      const page = 1
      const action = {
        type: SET_KEYS_ON_PAGE_FOR_LOCK,
        lock: lock.address,
        page,
        keys: [],
      }
      mockWeb3Service.getKeysForLockOnPage = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeysForLockOnPage).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('ADD_LOCK', () => {
    it('should handle ADD_LOCK by loading keys for the current user', () => {
      const { next, invoke, store } = create()
      const action = { type: ADD_LOCK, address: lock.address }
      mockWeb3Service.getKeyByLockForOwner = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
        lock.address,
        store.getState().account.address
      )
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should handle ADD_LOCK bbut not load keys if the lock is pending', () => {
      const { next, invoke, store } = create()
      store.getState().locks[lock.address].pending = true
      const action = { type: ADD_LOCK, address: lock.address }
      mockWeb3Service.getKeyByLockForOwner = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('UPDATE_LOCK', () => {
    it('should handle UPDATE_LOCK by loading keys for the current user', () => {
      const { next, invoke, store } = create()
      const action = { type: UPDATE_LOCK, address: lock.address }
      mockWeb3Service.getKeyByLockForOwner = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
        lock.address,
        store.getState().account.address
      )
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should handle UPDATE_LOCK bbut not load keys if the lock is pending', () => {
      const { next, invoke, store } = create()
      store.getState().locks[lock.address].pending = true
      const action = { type: UPDATE_LOCK, address: lock.address }
      mockWeb3Service.getKeyByLockForOwner = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
