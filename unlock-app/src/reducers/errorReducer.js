import { SET_ERROR, RESET_ERROR } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = {}

let errorKey = 0

function nextKey() {
  return errorKey++
}

const errorReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    const next = nextKey()
    return {
      ...state,
      [next]: {
        id: next,
        error: action.error,
      },
    }
  }

  if (action.type === RESET_ERROR) {
    const nextState = { ...state }
    delete nextState[action.id]
    return nextState
  }

  return state
}

export default errorReducer
