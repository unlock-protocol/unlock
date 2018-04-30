import { SET_NETWORK } from '../actions/network'

const initialState = null

const networkReducer = (state = initialState, action) => {
  if (action.type === SET_NETWORK) {
    return action.network
  }

  return state
}

export default networkReducer
