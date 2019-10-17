import { UPDATE_EVENT, SAVED_EVENT } from '../actions/event'

export const initialState = {}

const eventReducer = (state = initialState, action) => {
  if (action.type === UPDATE_EVENT) {
    return {
      ...action.event,
    }
  }

  if (action.type === SAVED_EVENT) {
    return {
      ...action.event,
      saved: true,
    }
  }

  return state
}

export default eventReducer
