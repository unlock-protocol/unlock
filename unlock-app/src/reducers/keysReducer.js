import { ADD_KEY, PURCHASE_KEY, UPDATE_KEY } from '../actions/key'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = {}

const keysReducer = (state = initialState, action) => {
  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type === PURCHASE_KEY) {
    return {
      [action.key.id]: action.key,
      ...state,
    }
  }

  if (action.type === ADD_KEY) {
    return {
      [action.key.id]: action.key,
      ...state,
    }
  }

  if (action.type === UPDATE_KEY) {
    if (action.update.id && action.update.id !== action.id) {
      throw new Error('Could not change the key id')
    }

    if (!state[action.id]) {
      throw new Error('Could not update missing key')
    }

    return {
      ...state,
      [action.id]: Object.assign(state[action.id], action.update),
    }
  }

  return state
}

export default keysReducer
