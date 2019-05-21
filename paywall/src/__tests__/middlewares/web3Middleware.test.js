import EventEmitter from 'events'
import { LOCATION_CHANGE } from 'connected-react-router'
import web3Middleware from '../../middlewares/web3Middleware'
import { ADD_LOCK, UPDATE_LOCK } from '../../actions/lock'
import { UPDATE_KEY, updateKey, addKey } from '../../actions/key'
import { UPDATE_ACCOUNT, setAccount } from '../../actions/accounts'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  NEW_TRANSACTION,
  addTransaction,
} from '../../actions/transaction'
import { SET_ERROR } from '../../actions/error'
import { SET_PROVIDER, setProvider } from '../../actions/provider'
import { SET_NETWORK, setNetwork } from '../../actions/network'
import configure from '../../config'
import { TRANSACTION_TYPES } from '../../constants'

const config = configure()

/**
 * Fake state
 */
let account = {
  address: '0xabc',
}
let key
let lock = {
  address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  keyPrice: '100',
  owner: account,
}
let state = {}

let transaction = {
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
    Web3Service: function() {
      return mockWeb3Service
    },
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
  transaction = {
    hash: '0xf21e9820af34282c8bebb3a191cf615076ca06026a144c9c28e9cb762585472e',
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

  describe('lock.updated', () => {
    describe('if the lock already exists', () => {
      it('should propagate more recent updates', () => {
        expect.assertions(1)
        const { store } = create()
        const lock = {
          address: '0x123',
          asOf: 10,
        }
        state.locks = {
          [lock.address]: lock,
        }
        mockWeb3Service.getKeyByLockForOwner = jest.fn()

        const update = {
          asOf: 11,
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

      it('it should not dispatch older updates', () => {
        expect.assertions(1)
        const { store } = create()
        const lock = {
          address: '0x123',
          asOf: 12,
        }
        state.locks = {
          [lock.address]: lock,
        }
        mockWeb3Service.getKeyByLockForOwner = jest.fn()

        const update = {
          asOf: 11,
        }
        mockWeb3Service.emit('lock.updated', lock.address, update)
        expect(store.dispatch).not.toHaveBeenCalled()
      })
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

    it('it should not refresh account balance if the account is not currently set', () => {
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

      state.account = null
      mockWeb3Service.emit('key.saved', '0xabc', key)
      expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock.address)
      expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
        lock.address,
        key.owner
      )
      expect(mockWeb3Service.refreshAccountBalance).not.toHaveBeenCalled()
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
        transaction: {
          hash: transaction.hash,
          network: 'test',
        },
      })
    )
  })

  it('it should handle transaction.updated events triggered by the web3Service', () => {
    expect.assertions(1)
    state.transactions = {
      [transaction.hash]: {
        ...transaction,
        bar: 'foo',
      },
    }
    const { store } = create()
    const update = {
      foo: 'bar',
    }
    mockWeb3Service.emit('transaction.updated', transaction.hash, update)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_TRANSACTION,
        hash: transaction.hash,
        update: {
          ...transaction,
          ...update,
          bar: 'foo',
        },
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

  describe('on the paywall', () => {
    it('should handle SET_ACCOUNT by getting all keys for the owner of that account', async () => {
      expect.assertions(2)
      mockWeb3Service.refreshAccountBalance = jest.fn()
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      const lock = '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9'
      state.router.location.pathname = `/${lock}/`

      const { invoke } = create()

      const newAccount = {
        address: '0x345',
      }
      invoke(setAccount(newAccount))

      expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalled()
      // We need to await this for the next assertion to work
      expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
        lock,
        '0x345'
      )
    })

    it('for SET_ACCOUNT calls, should retrieve transaction if present in the URL', () => {
      expect.assertions(1)
      mockWeb3Service.refreshAccountBalance = jest.fn()
      mockWeb3Service.getKeyByLockForOwner = jest.fn()

      const transaction =
        '0x1234567890123456789012345678901234567890123456789012345678901234'
      state.router.location = {
        pathname: `/${lock.address}`,
        hash: `#${transaction}`,
      }

      const { invoke, store } = create()

      invoke(setAccount({ address: 'hi' }))

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining(
          addTransaction({ hash: transaction, network: 'test' })
        )
      )
    })

    it.each([[SET_PROVIDER, setProvider], [SET_NETWORK, setNetwork]])(
      'should refresh the lock if %s is called',
      async (key, action) => {
        expect.assertions(1)
        mockWeb3Service.getLock = jest.fn()

        const lock = '0x42dbdc4CdBda8dc99c82D66d97B264386E41c0E9'
        state.router.location.pathname = `/${lock}/`

        const { invoke } = create()

        invoke(action('hi'))

        expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock)
      }
    )

    it.each([[SET_PROVIDER, setProvider], [SET_NETWORK, setNetwork]])(
      'should dispatch ADD_TRANSACTION if %s is called and transaction is in the URL',
      async (key, action) => {
        expect.assertions(1)
        mockWeb3Service.getLock = jest.fn()

        const transaction =
          '0x1234567890123456789012345678901234567890123456789012345678901234'
        state.router.location = {
          pathname: `/${lock.address}`,
          hash: `#${transaction}`,
        }

        const { invoke, store } = create()

        invoke(action('hi'))

        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining(
            addTransaction({ hash: transaction, network: 'test' })
          )
        )
      }
    )
  })

  it("should handle LOCATION_CHANGE if a lock is passed by calling web3Service's getLock", () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = {
      type: LOCATION_CHANGE,
      payload: { location: { pathname: `/${lock.address}` }, hash: '' },
    }
    state.router.location = action.payload.location
    mockWeb3Service.getLock = jest.fn()
    invoke(action)
    expect(mockWeb3Service.getLock).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle LOCATION_CHANGE if a transaction is passed by dispatching ADD_TRANSACTION', () => {
    expect.assertions(2)
    const { next, invoke, store } = create()
    // transaction hashes are 64 digits long
    const transaction =
      '0x1234567890123456789012345678901234567890123456789012345678901234'
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: { pathname: `/${lock.address}`, hash: `#${transaction}` },
      },
    }
    state.router.location = action.payload.location
    mockWeb3Service.getTransaction = jest.fn()
    mockWeb3Service.getLock = jest.fn()
    invoke(action)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining(
        addTransaction({ hash: transaction, network: 'test' })
      )
    )
    expect(next).toHaveBeenCalledWith(action)
  })

  it("should handle LOCATION_CHANGE and not call web3Service's getLock if no lock is passed", () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = {
      type: LOCATION_CHANGE,
      payload: { location: { pathname: '/static/paywall.min.js', hash: '' } },
    }
    mockWeb3Service.getLock = jest.fn()
    mockWeb3Service.getTransaction = jest.fn()
    invoke(action)
    expect(mockWeb3Service.getLock).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(action)
  })

  it("should handle LOCATION_CHANGE and not call web3Service's getTransaction if no transaction is passed", () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = {
      type: LOCATION_CHANGE,
      payload: { location: { pathname: '/static/paywall.min.js', hash: '' } },
    }
    mockWeb3Service.getLock = jest.fn()
    mockWeb3Service.getTransaction = jest.fn()
    invoke(action)
    expect(mockWeb3Service.getTransaction).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('ADD_LOCK', () => {
    it('should handle ADD_LOCK by loading keys for the current user', () => {
      expect.assertions(2)
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

    it('should not retrieve the key if there is no current user', () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: ADD_LOCK, address: lock.address }

      delete state.account

      mockWeb3Service.getKeyByLockForOwner = jest.fn()
      invoke(action)

      expect(mockWeb3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it('should handle ADD_TRANSACTION', () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = { type: ADD_TRANSACTION, transaction }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash
    )
  })

  it('should handle ADD_TRANSACTION with data input', () => {
    expect.assertions(2)
    const { next, invoke } = create()
    const action = {
      type: ADD_TRANSACTION,
      transaction: {
        ...transaction,
        input: 'data',
      },
    }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      action.transaction
    )
  })

  it('should handle NEW_TRANSACTION', () => {
    expect.assertions(3)
    const {
      next,
      invoke,
      store: { dispatch },
    } = create()
    const action = { type: NEW_TRANSACTION, transaction }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
    )
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('should dispatch key update on NEW_TRANSACTION if it is a key purchase of our lock from us', () => {
    expect.assertions(3)
    state.router = {
      location: {
        pathname: `/${lock.address}`,
        hash: '',
        search: '',
      },
    }
    transaction = {
      ...transaction,
      to: lock.address,
      from: account.address,
      type: TRANSACTION_TYPES.KEY_PURCHASE,
    }
    state.transactions = {
      [transaction.hash]: transaction,
    }
    const {
      next,
      invoke,
      store: { dispatch },
    } = create()
    const action = { type: NEW_TRANSACTION, transaction }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
    )
    expect(dispatch).toHaveBeenCalledWith(
      updateKey(
        key.id,
        expect.objectContaining({
          ...key,
          transactions: {
            [transaction.hash]: transaction,
          },
        })
      )
    )
  })

  it('should dispatch key update on UPDATE_TRANSACTION if it is a key purchase of our lock from us and key exists', () => {
    expect.assertions(2)
    state.router = {
      location: {
        pathname: `/${lock.address}`,
        hash: '',
        search: '',
      },
    }
    transaction = {
      ...transaction,
      to: lock.address,
      from: account.address,
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: key.id,
      lock: lock.address,
    }
    key.expiration = 1234
    state.transactions = {
      [transaction.hash]: transaction,
    }
    const {
      next,
      invoke,
      store: { dispatch },
    } = create()
    const action = {
      type: UPDATE_TRANSACTION,
      transaction,
      hash: transaction.hash,
    }

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining(
        updateKey(key.id, {
          ...key,
          transactions: {
            [transaction.hash]: transaction,
          },
        })
      )
    )
  })

  it('should dispatch add key on UPDATE_TRANSACTION if it is a key purchase of our lock from us and key does not exist', () => {
    expect.assertions(2)
    state.router = {
      location: {
        pathname: `/${lock.address}`,
        hash: '',
        search: '',
      },
    }
    transaction = {
      ...transaction,
      to: lock.address,
      from: account.address,
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      key: key.id,
      lock: lock.address,
    }
    key.expiration = 1234
    state.keys = {}
    state.transactions = {
      [transaction.hash]: transaction,
    }
    const {
      next,
      invoke,
      store: { dispatch },
    } = create()
    const action = {
      type: UPDATE_TRANSACTION,
      transaction,
      hash: transaction.hash,
    }

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining(
        addKey(key.id, {
          ...key,
          expiration: 0,
          transactions: {
            [transaction.hash]: transaction,
          },
        })
      )
    )
  })

  describe('UPDATE_LOCK', () => {
    it('should handle UPDATE_LOCK by loading keys for the current user', () => {
      expect.assertions(2)
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
  })
})
