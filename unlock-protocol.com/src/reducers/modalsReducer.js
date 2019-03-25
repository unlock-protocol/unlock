import { SHOW_MODAL, HIDE_MODAL } from '../actions/modal'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = {}

const errorReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
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
