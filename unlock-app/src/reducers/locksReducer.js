import { SET_LOCK } from '../actions/lock'

const initialState = {}

const locksReducer = (state = initialState, action) => {

  if (action.type === SET_LOCK) {
    return { ...state,
      [action.lock.address]: action.lock,
    }
  }

  return state
}

export default locksReducer
