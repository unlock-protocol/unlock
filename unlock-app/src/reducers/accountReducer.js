import { SET_ACCOUNT, RESET_ACCOUNT_BALANCE } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = {}

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type === RESET_ACCOUNT_BALANCE) {
    const account = {
      ...state,
    }
    account.balance = action.balance
    return account
  }

  return {
    ...state,
  }
}

export default accountReducer
