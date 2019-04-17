import {
  ADD_EVENT,
  addEvent,
  TICKET_ERROR,
  ticketError,
  SIGN_ADDRESS,
  signAddress,
  GOT_SIGNED_ADDRESS,
  gotSignedAddress,
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
    const signedAddress = 'ENCRYPTED'
    const expectedAction = {
      type: GOT_SIGNED_ADDRESS,
      signedAddress,
    }

    expect(gotSignedAddress(signedAddress)).toEqual(expectedAction)
  })
})
