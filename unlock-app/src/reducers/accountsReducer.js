import { ACCOUNTS_FETCHED } from '../actions/accounts'

const initialState = []

const accountsReducer = (state = initialState, action) => {
  if (action.type === ACCOUNTS_FETCHED) {
    return action.accounts
  }

  return state
}

export default accountsReducer
