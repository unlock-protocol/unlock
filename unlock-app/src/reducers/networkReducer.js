import { SET_NETWORK } from '../actions/network'
import lockReducer from './lockReducer'
import keyReducer from './keyReducer'

const initialState = {
  name: null,
}

const networkReducer = (state = initialState, action) => {
  if (action.type === SET_NETWORK) {
    return {
      name: action.network,
    }
  }

  return {
    ...state,
    lock: lockReducer(state.lock, action),
    key: keyReducer(state.key, action),
  }
}

export default networkReducer
