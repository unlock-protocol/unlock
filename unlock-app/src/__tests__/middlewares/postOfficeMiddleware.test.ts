import { EventEmitter } from 'events'
import {
  IframePostOfficeWindow,
  PostMessageListener,
  PostMessageTarget,
} from '../../utils/postOffice'
import { PostOfficeEvents } from '../../services/postOfficeService'
import postOfficeMiddleware from '../../middlewares/postOfficeMiddleware'

class MockPostOfficeService extends EventEmitter {
  constructor() {
    super()
  }
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

      expect(store.dispatch).toHaveBeenCalled()
    })
  })

  it('should pass actions on to the next middleware', () => {
    expect.assertions(1)

    const { invoke } = makeMiddleware()
    const action = {
      type: 'any',
    }

    invoke(action)

    expect(next).toHaveBeenCalledWith(action)
  })
})
