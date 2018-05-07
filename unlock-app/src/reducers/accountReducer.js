import { SET_ACCOUNT } from '../actions/accounts'

const initialState = null

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  return state
}

export default accountReducer
