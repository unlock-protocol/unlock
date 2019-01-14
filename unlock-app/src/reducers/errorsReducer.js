import { SET_ERROR, RESET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = []

const errorsReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    return [...state, action.error]
  }

  if (action.type === RESET_ERROR) {
    if (!action.error) return initialState
    const newState = [...state]
    const newIndex = newState.indexOf(action.error)
    if (newIndex >= 0) newState.splice(newIndex, 1)
    return newState
  }

  return state
}

export default errorsReducer
