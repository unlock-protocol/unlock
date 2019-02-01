import postMessageMiddleware from '../../middlewares/postMessageMiddleware'
import { openNewWindowModal } from '../../actions/modal'

describe('postMessageMiddleware', () => {
  it('does responds to OPEN_MODAL_IN_NEW_WINDOW if in an iframe', () => {
    expect.assertions(2)
    const next = jest.fn()

    const action = openNewWindowModal()

    const window = {
      parent: {
        contentWindow: {
          postMessage: jest.fn(),
          origin: 'origin',
        },
      },
    }

    const middleware = postMessageMiddleware(window)

    middleware()(next)(action)

    expect(next).toHaveBeenCalledWith(action)
    expect(window.parent.contentWindow.postMessage).toHaveBeenCalledWith(
      'redirect',
      'origin'
    )
  })
  it('passes actions to the next middleware', () => {
    expect.assertions(1)
    const next = jest.fn()

    const action = {
      type: 'boo',
    }

    const window = {}

    const middleware = postMessageMiddleware(window)

    middleware()(next)(action)
    expect(next).toHaveBeenCalledWith(action)
  })
})
