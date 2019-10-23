import { SET_ACCOUNT } from '../actions/accounts'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SIGNED_DATA } from '../actions/signature'

export const initialState = {}

const signatureReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SIGNED_DATA) {
    return {
      ...state,
      [action.id]: {
        data: action.data,
        signature: action.signature,
      },
    }
  }

  return state
}

export default signatureReducer
