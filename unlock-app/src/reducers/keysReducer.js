import { ADD_KEY, PURCHASE_KEY, UPDATE_KEY } from '../actions/key'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = {}

const keysReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
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

  if (action.type === ADD_KEY) {
    if (action.key.id && action.key.id !== action.id) {
      // 'Could not add key with wrong id' => Let's not change state
      return state
    }

    if (state[action.id]) {
      // 'Could not add already existing key' => Let's not change state
      return state
    }

    return {
      ...state,
      [action.id]: {
        ...action.key,
        id: action.id,
      },
    }
  }

  if (action.type === UPDATE_KEY) {
    if (action.update.id && action.update.id !== action.id) {
      // 'Could not change the key id' => Let's not change state
      return state
    }

    if (!state[action.id]) {
      // 'Could not update missing key' => Let's not change state
      return state
    }

    return {
      ...state,
      [action.id]: Object.assign(state[action.id], action.update),
    }
  }

  return state
}

export default keysReducer
