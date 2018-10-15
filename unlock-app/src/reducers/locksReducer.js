import { CREATE_LOCK, RESET_LOCK } from '../actions/lock'

const initialState = {}

const locksReducer = (state = initialState, action) => {

  if (action.type === CREATE_LOCK || action.type === RESET_LOCK) {
    return { ...state,
      [action.lock.id]: action.lock,
    }
  }

  return state
}

export default locksReducer
