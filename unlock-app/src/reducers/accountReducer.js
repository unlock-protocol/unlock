import { SET_ACCOUNT, RESET_ACCOUNT_BALANCE } from '../actions/accounts'

const initialState = {}

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
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
