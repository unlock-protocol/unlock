import UnlockJs from '@unlock-protocol/unlock-js'
import EventEmitter from 'events'
import web3Middleware from '../../middlewares/web3Middleware'
import { UPDATE_ACCOUNT, setAccount } from '../../actions/accounts'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  NEW_TRANSACTION,
} from '../../actions/transaction'
import { ADD_LOCK, UPDATE_LOCK } from '../../actions/lock'
import { SET_ERROR } from '../../actions/error'
import configure from '../../config'
import { TRANSACTION_TYPES } from '../../constants'
import { SET_KEY, setKey } from '../../actions/key'
import UnlockEventRSVP from '../../structured_data/unlockEventRSVP'
import {
  VERIFY_SIGNED_ADDRESS,
  signedAddressVerified,
} from '../../actions/ticket'

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
    Web3Service: function() {
      return mockWeb3Service
    },
  }
})

UnlockJs.mockImplementation = MockWebService

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

  it('should handle VERIFY_SIGNED_ADDRESS and emit a verified event when the addresses match', async () => {
    expect.hasAssertions()

    const { invoke } = create()
    const address = '0x12345678'
    const signedAddress = 'encrypted sig'

    const data = UnlockEventRSVP.build({
      publicKey: account.address,
      eventAddress: address,
    })

    const action = {
      type: VERIFY_SIGNED_ADDRESS,
      publicKey: account.address,
      eventAddress: address,
      signedAddress: 'encrypted sig',
    }

    mockWeb3Service.recoverAccountFromSignedData = jest.fn(async data => {
      JSON.parse(data).message.address.publicKey
    })

    invoke(action)

    expect(mockWeb3Service.recoverAccountFromSignedData).toHaveBeenCalledWith(
      JSON.stringify(data),
      signedAddress
    )
  })

  it('should handle VERIFY_SIGNED_ADDRESS and emit a mismatched event when the addresses do not match', () => {
    expect.hasAssertions()

    const { invoke } = create()
    const address = '0x12345678'
    const signedAddress = 'encrypted sig'

    const data = UnlockEventRSVP.build({
      publicKey: account.address,
      eventAddress: address,
    })

    const action = {
      type: VERIFY_SIGNED_ADDRESS,
      publicKey: account.address,
      eventAddress: address,
      signedAddress: 'encrypted sig',
    }

    mockWeb3Service.recoverAccountFromSignedData = jest.fn(
      async () => 'hello, I am an arbitrary string'
    )

    invoke(action)

    expect(mockWeb3Service.recoverAccountFromSignedData).toHaveBeenCalledWith(
      JSON.stringify(data),
      signedAddress
    )
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

  describe('when handling the key.updated events triggered by the web3Service', () => {
    it('it should dispatch setKey', () => {
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

      mockWeb3Service.emit('key.updated', keyId, { data: 'hello' })
      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_KEY,
        id: key.id,
        key: { data: 'hello' },
      })
    })
  })

  describe('when handling the key.saved events triggered by the web3Service', () => {
    it('it should dispatch setKey', () => {
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

      mockWeb3Service.emit('key.updated', keyId, { data: 'hello' })
      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_KEY,
        id: key.id,
        key: { data: 'hello' },
      })
    })
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
    }
    state.transactions = {
      [transaction.hash]: transaction,
    }
    const { next, invoke } = create()
    const action = { type: NEW_TRANSACTION, transaction }
    mockWeb3Service.getTransaction = jest.fn()

    invoke(action)
    expect(next).toHaveBeenCalled()
    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      transaction.hash,
      transaction
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
        setKey(key.id, {
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
        setKey(key.id, {
          ...key,
          expiration: 0,
          transactions: {
            [transaction.hash]: transaction,
          },
        })
      )
    )
  })

  it('should handle SET_ACCOUNT by refreshing balance and retrieving historical unlock transactions', async () => {
    expect.assertions(4)
    const mockTx = {
      transactionHash: '0x123',
    }
    mockWeb3Service.refreshAccountBalance = jest.fn()
    const lockCreationTransaction = Promise.resolve([mockTx])
    mockWeb3Service.getPastLockCreationsTransactionsForUser = jest.fn(
      () => lockCreationTransaction
    )
    mockWeb3Service.getKeyByLockForOwner = jest.fn()
    mockWeb3Service.getTransaction = jest.fn()

    const { invoke } = create()

    const newAccount = {
      address: '0x345',
    }
    invoke(setAccount(newAccount))

    expect(mockWeb3Service.refreshAccountBalance).toHaveBeenCalledWith(
      newAccount
    )
    expect(
      mockWeb3Service.getPastLockCreationsTransactionsForUser
    ).toHaveBeenCalledWith(newAccount.address)
    // We need to await this for the next assertion to work
    await lockCreationTransaction

    expect(mockWeb3Service.getTransaction).toHaveBeenCalledWith(
      mockTx.transactionHash
    )
    expect(mockWeb3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
  })

  it('should load keys for the user on address verification', async () => {
    expect.assertions(1)

    mockWeb3Service.getKeyByLockForOwner = jest.fn()

    const { invoke } = create()

    invoke(signedAddressVerified('0x123', 'encrypted string', '0x456'))

    expect(mockWeb3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
      '0x456',
      '0x123'
    )
  })
})
