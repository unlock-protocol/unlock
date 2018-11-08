import { SET_ERROR } from '../actions/error'

export const initialState = null

const errorReducer = (state = initialState, action) => {
  if (action.type === SET_ERROR) {
    return action.error
  }

  return state
}

export default errorReducer
