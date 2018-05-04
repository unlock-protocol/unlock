import lockMiddleware from '../../middlewares/lockMiddleware'
import { LOCATION_CHANGE } from 'react-router-redux'
import { CREATE_LOCK, SET_LOCK } from '../../actions/lock'
import { PURCHASE_KEY, SET_KEY } from '../../actions/key'
import { SET_ACCOUNT } from '../../actions/accounts'

/**
 * This is to use a mock for web3Service
 */
import web3ServiceMock from '../../services/web3Service'
import iframeServiceMock from '../../services/iframeService'

/**
 * Fake state
 */
const account = '0xabc'
const lock = {
  address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  keyPrice: () => 100,
}
const key = {
  expiration: '1337',
  data: '',
}
const state = {
  account,
}

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

  return { store, next, invoke }
}

/**
 * Mocking web3Service
 */
jest.mock('../../services/web3Service', () => {
  return {
    initWeb3Service: null,
    createLock: null,
    purchaseKey: null,
    getLock: null,
    getKey: null,
  }
})
jest.mock('../../services/iframeService', () => {
  return {
    sendMessage: null,
  }
})

beforeEach(() => {
  // Making sure all mocks are fresh and reset before each test
  Object.keys(web3ServiceMock).forEach((key) => {
    web3ServiceMock[key] = jest.fn()
  })
  Object.keys(iframeServiceMock).forEach((key) => {
    iframeServiceMock[key] = jest.fn()
  })
})

describe('Lock middleware', () => {
  it('should handle CREATE_LOCK by calling web3Service\'s createLock', () => {
    const { next, invoke } = create()
    const action = { type: CREATE_LOCK, lock }
    invoke(action)
    expect(web3ServiceMock.createLock).toHaveBeenCalledWith(lock, state.account)
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle PURCHASE_KEY by calling web3Service\'s purchaseKey', () => {
    const { next, invoke } = create()
    const action = { type: PURCHASE_KEY, lock, account }
    invoke(action)
    expect(web3ServiceMock.purchaseKey).toHaveBeenCalledWith(lock.address, account, 100, '')
    expect(next).toHaveBeenCalledWith(action)
  })

  it('should handle LOCATION_CHANGE by calling web3Service\'s getLock', () => {
    const { next, invoke } = create()
    const action = { type: LOCATION_CHANGE, payload: { pathname: `/lock/${lock.address}` } }
    invoke(action)
    expect(web3ServiceMock.getLock).toHaveBeenCalledWith(lock.address)
    expect(next).toHaveBeenCalledWith(action)
  })

  describe('when SET_ACCOUNT was called', () => {
    it('should call getKey if the lock is set', () => {
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account }
      state.lock = lock
      invoke(action)
      expect(web3ServiceMock.getKey).toHaveBeenCalledWith(lock.address, account)
      expect(next).toHaveBeenCalledWith(action)
    })
    it('should not call getKey if the lock is not set', () => {
      const { next, invoke } = create()
      const action = { type: SET_ACCOUNT, account }
      delete state.lock
      invoke(action)
      expect(web3ServiceMock.getKey).toHaveBeenCalledTimes(0)
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  describe('when SET_LOCK was called', () => {
    it('should call getKey', () => {
      const { next, invoke } = create()
      const action = { type: SET_LOCK, lock }
      state.account = account
      invoke(action)
      expect(web3ServiceMock.getKey).toHaveBeenCalledWith(lock.address, account)
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should call getKey if the account is not set', () => {
      const { next, invoke } = create()
      const action = { type: SET_LOCK, lock }
      delete state.account
      invoke(action)
      expect(web3ServiceMock.getKey).toHaveBeenCalledWith(lock.address, undefined)
      expect(next).toHaveBeenCalledWith(action)
    })
  })

  it('should handle SET_KEY by calling sendMessage from iframeService', () => {
    const { next, invoke } = create()
    const action = { type: SET_KEY, key }
    invoke(action)
    expect(iframeServiceMock.sendMessage).toHaveBeenCalledWith({ key })
    expect(next).toHaveBeenCalledWith(action)
  })
})