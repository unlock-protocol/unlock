import { SET_ACCOUNT, UPDATE_ACCOUNT } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = null

const accountReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ACCOUNT) {
    return action.account
  }

  if (action.type == UPDATE_ACCOUNT) {
    return Object.assign(state, action.update)
  }

  return state
}

export default accountReducer
