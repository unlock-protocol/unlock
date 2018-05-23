import { SET_NETWORK } from '../actions/network'
import accountReducer from './accountReducer'
import lockReducer from './lockReducer'
import keyReducer from './keyReducer'
import transactionReducer from './transactionReducer'

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
    key: keyReducer(state.key, action),
    transaction: transactionReducer(state.transaction, action),
  }

}

export default networkReducer
