import { SET_KEYS_ON_PAGE_FOR_LOCK } from '../actions/keysPages'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

export const initialState = {}

const keysPagesReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_KEYS_ON_PAGE_FOR_LOCK) {
    return {
      ...state,
      [action.lock]: {
        page: action.page,
        keys: action.keys,
      },
    }
  }

  return state
}

export default keysPagesReducer
