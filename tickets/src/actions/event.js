export const ADD_EVENT = 'event/ADD_EVENT'
export const LOAD_EVENT = 'event/LOAD_EVENT'
export const UPDATE_EVENT = 'event/UPDATE_EVENT'
export const EVENT_ERROR = 'event/EVENT_ERROR'
export const SAVED_EVENT = 'event/SAVED_EVENT'

export function eventError(error) {
  return {
    type: EVENT_ERROR,
    error: error,
  }
}
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

export const savedEvent = event => ({
  type: SAVED_EVENT,
  event,
})
