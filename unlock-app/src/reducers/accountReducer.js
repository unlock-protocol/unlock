import { SET_ACCOUNT, RESET_ACCOUNT_BALANCE } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = null

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type === RESET_ACCOUNT_BALANCE) {
    return {
      ...state,
      balance: action.balance,
    }
  }

  return state
}

export default accountReducer
