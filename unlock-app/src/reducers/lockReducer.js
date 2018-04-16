import { SET_LOCK, RESET_LOCK } from '../actions/lock'

const initialState = {
}

const lockReducer = (state = initialState, action) => {
  if (action.type === SET_LOCK) {
    return action.lock
  }

  if (action.type === RESET_LOCK) {
    return {
      ...(action.lock), // weird way to force redux to change its state
    }
  }

  return state
}

export default lockReducer
