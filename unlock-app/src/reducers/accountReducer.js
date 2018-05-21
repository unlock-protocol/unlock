import { SET_ACCOUNT, RESET_ACCOUNT_BALANCE } from '../actions/accounts'
import locksReducer from './locksReducer'

const initialState = {}

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  if (action.type === RESET_ACCOUNT_BALANCE) {
    state.balance = action.balance
    return state
  }

  return {
    ...state,
    locks: locksReducer(state.locks, action),
  }
}

export default accountReducer
