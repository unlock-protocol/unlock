import { SET_NETWORK } from '../actions/network'
import accountReducer, { initialState as defaultAccount } from './accountReducer'
import lockReducer, { initialState as defaultLock } from './lockReducer'

export const initialState = {
  name: 0,
  account: defaultAccount,
  lock: defaultLock,
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
