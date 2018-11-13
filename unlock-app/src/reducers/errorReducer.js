import { SET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = null

const errorReducer = (state = initialState, action) => {
  if (action.type === SET_ERROR) {
    return action.error
  }

  if (action.type == SET_PROVIDER) {
    return initialState
  }

  return state
}

export default errorReducer
