import wedlockMiddleware from '../../middlewares/wedlockMiddleware'
import configure from '../../config'
import { SEND_CONFIRMATION } from '../../actions/email'

/**
 * This is a "fake" middleware caller
 * Taken from https://redux.js.org/recipes/writing-tests#middleware
 */

let state = {}
let account = {
  address: '0xabc',
}

const create = () => {
  const config = configure()
  const store = {
    getState: jest.fn(() => state),
    dispatch: jest.fn(() => true),
  }
  const next = jest.fn()
  const handler = wedlockMiddleware(config)(store)
  const invoke = action => handler(next)(action)
  return { next, invoke, store }
}

let mockWedlockService = {}
jest.mock('../../services/wedlockService', () => {
  return function() {
    return mockWedlockService
  }
})

describe('Wedlock middleware', () => {
  beforeEach(() => {
    state = {
      account,
    }
    // reset the mock
    mockWedlockService = {}
  })

  describe('handling SEND_CONFIRMATION', () => {
    it('should send the confirmation email through wedlock', async () => {
      expect.assertions(2)
      const { next, invoke } = create()

      const recipient = 'julien@unlock-protocol.com'
      const ticket = 'data-uri'
      const eventName = 'The launch party!'
      const eventDate = 'Monday June 3rd, 2019'
      const ticketLink = 'http://tickets.unlock-protocol.com/0x123'

      const action = {
        type: SEND_CONFIRMATION,
        recipient,
        ticket,
        eventName,
        eventDate,
        ticketLink,
      }
      mockWedlockService.confirmEvent = jest.fn(() => {
        return Promise.resolve()
      })

      await invoke(action)
      expect(mockWedlockService.confirmEvent).toHaveBeenCalledWith(
        recipient,
        ticket,
        eventName,
        eventDate,
        ticketLink
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
