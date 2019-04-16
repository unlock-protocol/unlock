export const ADD_EVENT = 'ticket/ADD_EVENT'
export const TICKET_ERROR = 'ticket/TICKET_ERROR'

export const addEvent = event => ({
  type: ADD_EVENT,
  event,
})

export function ticketError(error) {
  return {
    type: TICKET_ERROR,
    error: error,
  }
}
