import lockMiddleware from '../../middlewares/lockMiddleware'
import { LOCATION_CHANGE } from 'react-router-redux'
import { CREATE_LOCK, SET_LOCK, WITHDRAW_FROM_LOCK } from '../../actions/lock'
import { PURCHASE_KEY, SET_KEY } from '../../actions/key'
import { SET_ACCOUNT, LOAD_ACCOUNT, CREATE_ACCOUNT } from '../../actions/accounts'
import { SET_NETWORK } from '../../actions/network'
import { SET_PROVIDER } from '../../actions/provider'

/**
 * This is to use a mock for web3Service
 */
// import Web3Service from '../../services/web3Service'
import iframeServiceMock from '../../services/iframeService'

// TODO: check that dispatch is invoked correctly when web3Services promises resolve!

/**
 * Fake state (will be reset in beforeEach)
 */
let account , lock , key, state

const privateKey = '0xdeadbeef'
const network = 'test'
const provider = 'Toshi'

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */
const create = () => {
  const store = {
    getState: jest.fn(() => (state)),
    dispatch: jest.fn(),
  }
  const next = jest.fn()

  const invoke = (action) => lockMiddleware(store)(next)(action)

  return { next, invoke, store }
}

/**
 * Mocking web3Service
 * Default objects yielded by promises
 */

let mockWeb3Service = {
  ready: true,
  connect: true,
  createLock: true,
  purchaseKey: true,
  getLock: true,
  createAccount: true,
  getKey: true,
  loadAccount: true,
  withdrawFromLock: true,
  getAddressBalance: true,
}

jest.mock('../../services/web3Service', () => {
  return (function() {
    return mockWeb3Service
  })
})
jest.mock('../../services/iframeService', () => {
  return {
    lockUnlessKeyIsValid: null,
  }
})

beforeEach(() => {
  // Making sure all mocks are fresh and reset before each test
  Object.keys(mockWeb3Service).forEach((key) => {
    mockWeb3Service[key] = jest.fn().mockReturnValue(new Promise((resolve, reject) => {return resolve()}))
  })
  Object.keys(iframeServiceMock).forEach((key) => {
    iframeServiceMock[key] = jest.fn()
  })

  // Reset state!
  account = {
    address: '0xabc',
  }
  lock = {
    address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    keyPrice: '100',
    creator: account,
  }
  key = {
    expiration: '1337',
    data: '',
  }
  state = {
    network: {},
    account,
    provider: 'HTTP',
  }

})

describe('Lock middleware', () => {

  describe('when web3Service is not ready', () => {

    it('should connect on any action and stop further execution', () => {
      mockWeb3Service.ready = false
      const { next, invoke } = create()
      const action = { type: SET_NETWORK, network }
      invoke(action)
      expect(mockWeb3Service.connect).toHaveBeenCalledWith({network: {}, provider: 'HTTP', account})
      expect(next).toHaveBeenCalledTimes(0) // ensures that execution was stopped
    })

  })

  it('should handle LOAD_ACCOUNT by calling web3Service', () => {
    const { next, invoke } = create()
    const action = { type: LOAD_ACCOUNT, privateKey }
    // const account = {} // mock
    // mockWeb3Service.loadAccount = jest.fn().mockReturnValue(new Promise((resolve, reject) => { return resolve(account) }))
    invoke(action)
    expect(mockWeb3Service.loadAccount).toHaveBeenCalledWith(privateKey)
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle SET_PROVIDER and reset the whole state', () => {
    const { next, invoke } = create()
    const action = { type: SET_PROVIDER, provider }
    invoke(action)
    expect(mockWeb3Service.connect).toHaveBeenCalledWith({
      'network': {
        'name': 'Unknown',
      },
      'provider': provider,
      account: null, // This is important because when we change provider, we want to reset the account
    })
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle CREATE_LOCK by calling web3Service\'s createLock', () => {
    const { next, invoke } = create()
    const action = { type: CREATE_LOCK, lock }
    invoke(action)
    expect(mockWeb3Service.createLock).toHaveBeenCalledWith(lock, expect.anything()) // TODO: Can we be more specific? (this is a function)
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle PURCHASE_KEY by calling web3Service\'s purchaseKey', () => {
    const { next, invoke } = create()
    const action = { type: PURCHASE_KEY, lock, account }
    invoke(action)
    expect(mockWeb3Service.purchaseKey).toHaveBeenCalledWith(lock.address, account, '100', '', expect.anything()) // TODO: Can we be more specific? (this is a function)
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle LOCATION_CHANGE by calling web3Service\'s getLock', () => {
    const { next, invoke } = create()
    const action = { type: LOCATION_CHANGE, payload: { pathname: `/lock/${lock.address}` } }
    invoke(action)
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(lock.address)
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle CREATE_ACCOUNT by calling web3Service\'s createAccount', () => {
    const { next, invoke } = create()
    const action = { type: CREATE_ACCOUNT }
    invoke(action)
    expect(mockWeb3Service.createAccount).toHaveBeenCalledWith()
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('when SET_ACCOUNT was called', () => {
    it('should call getKey if the lock is set', () => {
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account }
      state.network.lock = lock
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledWith(lock.address, account)
      expect(next).toHaveBeenCalledWith(action)
    })
    it('should not call getKey if the lock is not set', () => {
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account }
      delete state.network.lock
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledTimes(0)
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('when SET_LOCK was called', () => {
    it('should call getKey', () => {
      const { next, invoke } = create()
      const action = { type: SET_LOCK, lock }
      state.account = account
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledWith(lock.address, account)
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should call getKey if the account is not set', () => {
      const { next, invoke } = create()
      const action = { type: SET_LOCK, lock }
      delete state.account
      invoke(action)
      expect(mockWeb3Service.getKey).toHaveBeenCalledWith(lock.address, undefined)
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it('should handle SET_KEY by calling lockUnlessKeyIsValid from iframeService', () => {
    const { next, invoke } = create()
    const action = { type: SET_KEY, key }
    invoke(action)
    expect(iframeServiceMock.lockUnlessKeyIsValid).toHaveBeenCalledWith({ key })
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle WITHDRAW_FROM_LOCK by calling withdrawFromLock from web3Service', () => {
    const { next, invoke, store } = create()
    const action = { type: WITHDRAW_FROM_LOCK, lock }
    invoke(action)

    expect(mockWeb3Service.withdrawFromLock).toHaveBeenCalledWith(lock, store.getState().account)
    expect(next).toHaveBeenCalledWith(action)
  })
})
