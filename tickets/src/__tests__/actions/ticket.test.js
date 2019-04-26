import {
  ADD_EVENT,
  addEvent,
  LOAD_EVENT,
  loadEvent,
  SAVE_EVENT,
  saveEvent,
  UPDATE_EVENT,
  updateEvent,
  TICKET_ERROR,
  ticketError,
  SIGN_ADDRESS,
  signAddress,
  GOT_SIGNED_ADDRESS,
  gotSignedAddress,
} from '../../actions/ticket'

describe('ticket actions', () => {
  it('should create an event to add a ticketed event', () => {
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

  it('should create an event to load a ticketed event', () => {
    expect.assertions(1)
    const address = '0x123'
    const expectedAction = {
      type: LOAD_EVENT,
      address,
    }
    expect(loadEvent(address)).toEqual(expectedAction)
  })

  it('should create an action to update a ticketed event in the store', () => {
    expect.assertions(1)
    const event = {}
    const expectedAction = {
      type: UPDATE_EVENT,
      event,
    }
    expect(updateEvent(event)).toEqual(expectedAction)
  })

  it('should create an event to save a ticketed event', () => {
    expect.assertions(1)
    const event = {}
    const token = {}
    const expectedAction = {
      type: SAVE_EVENT,
      event,
      token,
    }
    expect(saveEvent(event, token)).toEqual(expectedAction)
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

  it('should create an action emitting a request to sign a ticket', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const expectedAction = {
      type: SIGN_ADDRESS,
      address,
    }

    expect(signAddress(address)).toEqual(expectedAction)
  })

  it('should create an action emitting an address that has been signed', () => {
    expect.assertions(1)
    const address = '0x12345678'
    const signedAddress = 'ENCRYPTED'
    const expectedAction = {
      type: GOT_SIGNED_ADDRESS,
      address,
      signedAddress,
    }

    expect(gotSignedAddress(address, signedAddress)).toEqual(expectedAction)
  })
})
