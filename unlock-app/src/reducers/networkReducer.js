import { SET_NETWORK } from '../actions/network'

export const initialState = {
  name: 0,
}

const networkReducer = (state = initialState, action) => {
  if (action.type === SET_NETWORK) {
    return {
      name: action.network,
    }
  }

  return {
    ...state,
  }
}

export default networkReducer
