import { SHOW_MODAL, HIDE_MODAL } from '../actions/modal'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = {}

const errorReducer = (state = initialState, action) => {
  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type == SHOW_MODAL) {
    return {
      ...state,
      [action.modal]: true,
    }
  }

  if (action.type == HIDE_MODAL) {
    const newState = { ...state }
    delete newState[action.modal]
    return newState
  }

  return state
}

export default errorReducer
