import { ADD_KEY, PURCHASE_KEY } from '../actions/key'

export const initialState = {}

const keysReducer = (state = initialState, action) => {
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
