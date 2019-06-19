import {
  IframePostOfficeWindow,
  PostMessageListener,
  PostMessageTarget,
} from '../../utils/postOffice'
import postOfficeMiddleware from '../../middlewares/postOfficeMiddleware'

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

  function makeMiddleware() {
    return postOfficeMiddleware(fakeWindow)(fakeStore)(next)
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

  it('should pass actions on to the next middleware', () => {
    expect.assertions(1)

    const middleware = makeMiddleware()
    const action = {
      type: 'any',
    }

    middleware(action)

    expect(next).toHaveBeenCalledWith(action)
  })
})
