import { UPDATE_EVENT } from '../actions/event'

export const initialState = {}

const eventReducer = (state = initialState, action) => {
  if (action.type === UPDATE_EVENT) {
    return {
      ...action.event,
    }
  }

  return state
}

export default eventReducer
