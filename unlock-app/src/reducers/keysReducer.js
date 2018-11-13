import { ADD_KEY, PURCHASE_KEY } from '../actions/key'
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

  return state
}

export default keysReducer
