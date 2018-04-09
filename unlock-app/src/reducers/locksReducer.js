import { NEW_LOCK, SET_LOCK } from '../actions/lock'

const initialState = {
}

const locksReducer = (state = initialState, action) => {
  if (action.type === NEW_LOCK) {
    return new Set([
      ...state,
      action.lockAddress
    ])
  }

  if (action.type === SET_LOCK) {
    return new Set([
      ...state,
      action.lock.address
    ])
  }

  return state
}

export default locksReducer
