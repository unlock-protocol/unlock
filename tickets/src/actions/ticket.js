export const ADD_EVENT = 'ticket/ADD_EVENT'
export const LOAD_EVENT = 'ticket/LOAD_EVENT'
export const UPDATE_EVENT = 'ticket/UPDATE_EVENT'
export const TICKET_ERROR = 'ticket/TICKET_ERROR'
export const SIGN_ADDRESS = 'ticket/SIGN_ADDRESS'
export const GOT_SIGNED_ADDRESS = 'ticket/GOT_SIGNED_ADDRESS'

export const addEvent = (event, token) => ({
  type: ADD_EVENT,
  event,
  token,
})

export const loadEvent = address => ({
  type: LOAD_EVENT,
  address,
})

export const updateEvent = event => ({
  type: UPDATE_EVENT,
  event,
})

export function ticketError(error) {
  return {
    type: TICKET_ERROR,
    error: error,
  }
}

export const signAddress = address => ({
  type: SIGN_ADDRESS,
  address,
})

export const gotSignedAddress = (address, signedAddress) => ({
  type: GOT_SIGNED_ADDRESS,
  address,
  signedAddress,
})
