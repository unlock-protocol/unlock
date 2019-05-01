import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'
import { UPDATE_EVENT } from '../actions/event'

export const initialState = {}

const eventReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === UPDATE_EVENT) {
    return {
      ...action.event,
    }
  }

  return state
}

export default eventReducer
