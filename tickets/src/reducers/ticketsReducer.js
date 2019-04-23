import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'
import { GOT_SIGNED_ADDRESS, UPDATE_EVENT } from '../actions/ticket'

export const initialState = {}

const ticketsReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === GOT_SIGNED_ADDRESS) {
    const { address, signedAddress } = action
    return {
      [address]: signedAddress,
      ...state,
    }
  }

  if (action.type === UPDATE_EVENT) {
    const { event } = action
    return {
      event,
      ...state,
    }
  }

  return state
}

export default ticketsReducer
