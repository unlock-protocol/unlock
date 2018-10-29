import { SET_NETWORK } from '../actions/network'
import accountReducer, { initialState as defaultAccount } from './accountReducer'

export const initialState = {
  name: 0,
  account: defaultAccount,
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
  }

}

export default networkReducer
