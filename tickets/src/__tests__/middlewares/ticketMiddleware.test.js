import ticketMiddleware from '../../middlewares/ticketMiddleware'
import { LOAD_EVENT } from '../../actions/ticket'
import { SIGNED_DATA } from '../../actions/signature'
import configure from '../../config'
import UnlockEvent from '../../structured_data/unlockEvent'

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

  describe('handling SIGNED_DATA for events', () => {
    it('should save the event', async () => {
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
      const structuredData = UnlockEvent.build(event)
      const action = {
        type: SIGNED_DATA,
        data: structuredData,
        signature: 'foo',
      }
      mockTicketService.saveEvent = jest.fn(() => {
        return Promise.resolve()
      })
      await invoke(action)

      expect(mockTicketService.saveEvent).toHaveBeenCalledWith(
        structuredData.message.event,
        'foo'
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('handling LOAD_EVENT', () => {
    it('should load an event from address', async () => {
      expect.assertions(2)
      const { next, invoke } = create()
      const action = { type: LOAD_EVENT, address: '0x123' }
      mockTicketService.getEvent = jest.fn(() => {
        return Promise.resolve()
      })

      await invoke(action)
      expect(mockTicketService.getEvent).toHaveBeenCalledWith('0x123')
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
