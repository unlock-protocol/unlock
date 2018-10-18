import { ADD_KEY } from '../actions/key'

const initialState = {}

const keysReducer = (state = initialState, action) => {

  if (action.type === ADD_KEY) {
    return {
      [action.key.id]: action.key,
      ...state,
    }
  }

  return state
}

export default keysReducer
