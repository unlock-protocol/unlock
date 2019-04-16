import {
  ADD_EVENT,
  addEvent,
  TICKET_ERROR,
  ticketError,
} from '../../actions/ticket'

describe('ticket actions', () => {
  it('should create an event to add an action', () => {
    expect.assertions(1)
    const event = {}
    const expectedAction = {
      type: ADD_EVENT,
      event,
    }
    expect(addEvent(event)).toEqual(expectedAction)
  })

  it('should create an action emitting a ticket error', () => {
    expect.assertions(1)
    const error = 'a comic error'

    const expectedError = {
      type: TICKET_ERROR,
      error: error,
    }

    expect(ticketError(error)).toEqual(expectedError)
  })
})
