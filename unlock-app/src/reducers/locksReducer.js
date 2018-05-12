import { SET_LOCK } from '../actions/lock'

const initialState = []

const locksReducer = (state = initialState, action) => {

  if (action.type === SET_LOCK) {
    var newState = [...state]
    let included = newState.reduce((included, l) => {
      return included || (l.address === action.lock.address)
    }, false)
    if (!included) {
      newState.push(action.lock)
    }
    return newState
  }

  return state
}

export default locksReducer
