import { EventEmitter } from 'events'
import {
  IframePostOfficeWindow,
  PostMessageListener,
  PostMessageTarget,
} from '../../utils/postOffice'
import { PostOfficeEvents } from '../../services/postOfficeService'
import postOfficeMiddleware from '../../middlewares/postOfficeMiddleware'
import { ADD_TO_CART } from '../../actions/keyPurchase'
import { KEY_PURCHASE_INITIATED } from '../../actions/user'
import { SET_ACCOUNT } from '../../actions/accounts'
import {
  USER_ACCOUNT_ADDRESS_STORAGE_ID,
  DEFAULT_USER_ACCOUNT_ADDRESS,
} from '../../constants'
import { SET_LOCKED_STATE } from '../../actions/pageStatus'
import { WEB3_CALL } from '../../actions/web3call'
import { web3MethodCall } from '../../windowTypes'

class MockPostOfficeService extends EventEmitter {
  constructor() {
    super()
  }
  showAccountModal = jest.fn()
  hideAccountModal = jest.fn()
  transactionInitiated = jest.fn()
  setAccount = jest.fn()
}

let mockPostOfficeService = new MockPostOfficeService()

jest.mock('../../services/postOfficeService', () => {
  const mockPostOffice = require.requireActual(
    '../../services/postOfficeService'
  ) // original module
  return {
    ...mockPostOffice,
    PostOfficeService: function() {
      return mockPostOfficeService
    },
  }
})

interface store {
  dispatch: (action: any) => void
  getState: () => any
}

describe('postOfficeMiddleware', () => {
  let fakeWindow: IframePostOfficeWindow
  let fakeTarget: PostMessageTarget
  let handlers: { [key: string]: PostMessageListener }
  let fakeStore: store
  let fakeState: any
  let next: (action: any) => void
  const mockConfig = {
    requiredNetworkId: 1984,
  }

  function makeMiddleware() {
    return {
      invoke: postOfficeMiddleware(fakeWindow, mockConfig)(fakeStore)(next),
      store: fakeStore,
    }
  }

  beforeEach(() => {
    handlers = {}
    fakeState = {}
    next = jest.fn()
    fakeStore = {
      dispatch: jest.fn(),
      getState: jest.fn(() => fakeState),
    }
    fakeTarget = {
      postMessage: jest.fn(),
    }
    fakeWindow = {
      addEventListener(type, handler) {
        handlers[type] = handler
      },
      parent: fakeTarget,
      location: {
        href: 'http://example.com?origin=origin',
      },
      localStorage: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 15,
        key: jest.fn(),
      },
    }
  })

  describe('setting account', () => {
    it('should set account to the default address when there is nothing in localStorage', () => {
      expect.assertions(1)

      makeMiddleware()

      expect(mockPostOfficeService.setAccount).toHaveBeenLastCalledWith(
        DEFAULT_USER_ACCOUNT_ADDRESS
      )
    })

    it('should set account to the default address when localStorage contains a malformed value', () => {
      expect.assertions(1)

      const anAddress = 'some random garbage'
      fakeWindow.localStorage.getItem = jest.fn(() => anAddress)

      makeMiddleware()

      expect(mockPostOfficeService.setAccount).toHaveBeenLastCalledWith(
        DEFAULT_USER_ACCOUNT_ADDRESS
      )
    })

    it('should set account to the value provided by localStorage, if it is a real address', () => {
      expect.assertions(1)

      const anAddress = '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5'
      fakeWindow.localStorage.getItem = jest.fn(() => anAddress)

      makeMiddleware()

      expect(mockPostOfficeService.setAccount).toHaveBeenLastCalledWith(
        anAddress
      )
    })
  })

  describe('Handling emitted PostOfficeEvents', () => {
    it('should dispatch setError when receiving Error', () => {
      expect.assertions(1)
      const { store } = makeMiddleware()

      mockPostOfficeService.emit(PostOfficeEvents.Error, 'this is an error')

      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error/SET_ERROR',
          error: {
            kind: 'PostOffice',
            level: 'Diagnostic',
            message: 'this is an error',
          },
        })
      )
    })

    it('should dispatch addToCart when receiving KeyPurchase', () => {
      expect.assertions(2)

      const { store } = makeMiddleware()
      const lock = 'a lock'
      const tip = '0'

      mockPostOfficeService.emit(PostOfficeEvents.LockUpdate, {
        'a lock': 'this is the lock payload',
      })
      mockPostOfficeService.emit(PostOfficeEvents.KeyPurchase, lock, tip)

      expect(mockPostOfficeService.showAccountModal).toHaveBeenCalled()
      expect(store.dispatch).toHaveBeenCalledWith({
        type: ADD_TO_CART,
        lock: 'this is the lock payload',
        tip,
      })
    })

    it('should set locked state when receiving Locked', () => {
      expect.assertions(1)

      const { store } = makeMiddleware()
      mockPostOfficeService.emit(PostOfficeEvents.Locked)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_LOCKED_STATE,
        isLocked: true,
      })
    })

    it('should set unlocked state when receiving Unlocked', () => {
      expect.assertions(1)

      const { store } = makeMiddleware()
      mockPostOfficeService.emit(PostOfficeEvents.Unlocked)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_LOCKED_STATE,
        isLocked: false,
      })
    })

    it('should dispatch web3Call when receiving a web3 call', () => {
      expect.assertions(1)

      const { store } = makeMiddleware()
      const payload: web3MethodCall = {
        method: 'personal_sign',
        params: [],
        id: 1337,
        jsonrpc: '2.0',
      }
      mockPostOfficeService.emit(PostOfficeEvents.Web3Call, payload)

      expect(store.dispatch).toHaveBeenCalledWith({
        type: WEB3_CALL,
        payload,
      })
    })
  })

  describe('handling actions', () => {
    it('should tell the paywall about account changes', () => {
      expect.assertions(2)
      const { invoke } = makeMiddleware()
      const action = {
        type: SET_ACCOUNT,
        account: {
          address: '0x123abc',
        },
      }

      invoke(action)

      expect(fakeWindow.localStorage.setItem).toHaveBeenCalledWith(
        USER_ACCOUNT_ADDRESS_STORAGE_ID,
        '0x123abc'
      )
      expect(mockPostOfficeService.setAccount).toHaveBeenCalledWith('0x123abc')
    })

    it('should tell the paywall about a purchase and dismiss itself when receiving KEY_PURCHASE_INITIATED', () => {
      expect.assertions(3)
      const { invoke } = makeMiddleware()
      const action = {
        type: KEY_PURCHASE_INITIATED,
      }

      invoke(action)

      expect(mockPostOfficeService.transactionInitiated).toHaveBeenCalled()
      expect(mockPostOfficeService.hideAccountModal).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(action)
    })

    it('should pass other actions on to the next middleware', () => {
      expect.assertions(1)

      const { invoke } = makeMiddleware()
      const action = {
        type: 'any',
      }

      invoke(action)

      expect(next).toHaveBeenCalledWith(action)
    })
  })
})
