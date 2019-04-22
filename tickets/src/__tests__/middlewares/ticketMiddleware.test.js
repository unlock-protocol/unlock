import ticketMiddleware from '../../middlewares/ticketMiddleware'
import { ADD_EVENT } from '../../actions/ticket'
import configure from '../../config'

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
  const handler = ticketMiddleware(config)(store)
  const invoke = action => handler(next)(action)
  return { next, invoke, store }
}

let mockTicketService = {}
jest.mock('../../services/ticketService', () => {
  return function() {
    return mockTicketService
  }
})

describe('Ticketing middleware', () => {
  beforeEach(() => {
    state = {
      account,
    }
    // reset the mock
    mockTicketService = {}
  })

  describe('handling ADD_EVENT', () => {
    it('should store the new event', async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const event = {
        lockAddress: '0x123',
        name: 'My party',
        description: '100th anniversary',
        date: new Date(2063, 11, 23),
        location: 'London',
        owner: 'ben',
        logo: '',
      }
      const action = { type: ADD_EVENT, event, token: null }
      mockTicketService.createEvent = jest.fn(() => {
        return Promise.resolve()
      })

      await invoke(action)

      expect(mockTicketService.createEvent).toHaveBeenCalledWith(event, null)
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
