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
    }
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
      const tip = 'a tip'

      mockPostOfficeService.emit(PostOfficeEvents.KeyPurchase, lock, tip)
      expect(mockPostOfficeService.showAccountModal).toHaveBeenCalled()
      expect(store.dispatch).toHaveBeenCalledWith({
        type: ADD_TO_CART,
        lock,
        tip,
      })
    })
  })

  describe('handling actions', () => {
    it('should tell the paywall about account changes', () => {
      expect.assertions(1)
      const { invoke } = makeMiddleware()
      const action = {
        type: SET_ACCOUNT,
        account: {
          address: '0x123abc',
        },
      }

      invoke(action)

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
