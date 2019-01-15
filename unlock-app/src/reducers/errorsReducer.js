import { SET_ERROR, RESET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = []

const errorsReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    if (state.includes(action.error)) return state
    return [...state, action.error]
  }

  if (action.type === RESET_ERROR) {
    if (!action.error) return initialState
    if (!state.includes(action.error)) return state
    const newState = [...state]
    const newIndex = newState.indexOf(action.error)
    newState.splice(newIndex, 1)
    return newState
  }

  return state
}

export default errorsReducer
