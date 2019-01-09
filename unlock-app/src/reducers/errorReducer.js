import { SET_ERROR, RESET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = []

const errorReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    return [...state, action.error]
  }

  if (action.type === RESET_ERROR) {
    if (!action.error) return initialState
    const nextState = [...state]
    nextState.splice(nextState.indexOf(action.error), 1)
    return nextState
  }

  return state
}

export default errorReducer
