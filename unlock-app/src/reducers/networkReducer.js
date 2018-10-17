import { SET_NETWORK } from '../actions/network'
import accountReducer from './accountReducer'
import lockReducer from './lockReducer'

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
    account: accountReducer(state.account, action),
    lock: lockReducer(state.lock, action),
  }

}

export default networkReducer
