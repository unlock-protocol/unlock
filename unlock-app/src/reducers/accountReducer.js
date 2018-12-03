import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = null

const accountReducer = (state = initialState, action) => {
  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type == UPDATE_ACCOUNT) {
    return Object.assign(state, action.update)
  }

  return state
}

export default accountReducer
