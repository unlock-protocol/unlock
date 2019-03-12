import { SET_ERROR, RESET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = []

const errorsReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    if (state.map(error => error.name).includes(action.error)) return state
    return [
      ...state,
      {
        name: action.error,
        data: action.data,
      },
    ]
  }

  if (action.type === RESET_ERROR) {
    // The no error is passed, reset all errors
    if (!action.error) return initialState

    // If the error to be reset is not in the list, nothing changes
    if (!state.find(error => action.error === error.name)) return state

    // Otherwise, only push to new state the all the other errors
    return state.filter(error => error.name !== action.error)
  }

  return state
}

export default errorsReducer
