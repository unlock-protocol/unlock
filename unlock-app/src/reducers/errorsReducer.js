import { SET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = []

const errorsReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    if (!action.error) return initialState
    return [...state, action.error]
  }

  return state
}

export default errorsReducer
