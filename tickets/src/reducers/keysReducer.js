import { SET_KEY, PURCHASE_KEY } from '../actions/key'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

export const initialState = {}

const keysReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === PURCHASE_KEY) {
    const id = action.key.id
      ? action.key.id
      : [action.key.lock, action.key.owner].join('-')
    return {
      [id]: {
        ...action.key,
        id,
      },
      ...state,
    }
  }

  if (action.type === SET_KEY) {
    if (action.key.id && action.key.id !== action.id) {
      // 'Could not add key with wrong id' => Let's not change state
      return state
    }

    // we update the key
    if (state[action.id]) {
      if (action.key.id && action.key.id !== action.id) {
        // 'Could not change the key id' => Let's not change state
        return state
      }
      return {
        ...state,
        [action.id]: { ...state[action.id], ...action.key },
      }
    }

    // We add the key
    return {
      ...state,
      [action.id]: {
        ...action.key,
        id: action.id,
      },
    }
  }

  return state
}

export default keysReducer
