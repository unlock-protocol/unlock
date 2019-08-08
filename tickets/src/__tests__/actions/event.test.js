import {
  ADD_EVENT,
  addEvent,
  LOAD_EVENT,
  loadEvent,
  UPDATE_EVENT,
  updateEvent,
  EVENT_ERROR,
  eventError,
  SAVED_EVENT,
  savedEvent,
} from '../../actions/event'

describe('event actions', () => {
  it('should create an event to add an event', () => {
    expect.assertions(1)
    const event = {}
    const token = {}
    const expectedAction = {
      type: ADD_EVENT,
      event,
      token,
    }
    expect(addEvent(event, token)).toEqual(expectedAction)
  })

  it('should create an event to load an event', () => {
    expect.assertions(1)
    const address = '0x123'
    const expectedAction = {
      type: LOAD_EVENT,
      address,
    }
    expect(loadEvent(address)).toEqual(expectedAction)
  })

  it('should create an action to update an event', () => {
    expect.assertions(1)
    const event = {}
    const expectedAction = {
      type: UPDATE_EVENT,
      event,
    }
    expect(updateEvent(event)).toEqual(expectedAction)
  })

  it('should create an action emitting a event error', () => {
    expect.assertions(1)
    const error = 'a comic error'

    const expectedError = {
      type: EVENT_ERROR,
      error: error,
    }

    expect(eventError(error)).toEqual(expectedError)
  })

  it('should create an action for saved event', () => {
    expect.assertions(1)
    const event = {}

    const expectedAction = {
      type: SAVED_EVENT,
      event,
    }

    expect(savedEvent(event)).toEqual(expectedAction)
  })
})
