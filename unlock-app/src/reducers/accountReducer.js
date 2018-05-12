import { SET_ACCOUNT } from '../actions/accounts'
import locksReducer from './locksReducer'

const initialState = {}

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  return {
    ...state,
    locks: locksReducer(state.locks, action),
  }
}

export default accountReducer
