import { SET_ENCRYPTED_PRIVATE_KEY } from '../actions/user'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'
import { Action } from '../unlockTypes' // eslint-disable-line no-unused-vars

export const initialState = null

const privateKeyReducer = (state = initialState, action: Action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ENCRYPTED_PRIVATE_KEY) {
    return action.key
  }

  return state
}

export default privateKeyReducer
