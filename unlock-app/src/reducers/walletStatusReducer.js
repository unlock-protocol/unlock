import {
  WAIT_FOR_WALLET,
  GOT_WALLET,
  DISMISS_CHECK,
} from '../actions/walletStatus'

import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

export const initialState = { waiting: false }

const walletStatusReducer = (walletStatus = initialState, action) => {
  if (
    [SET_PROVIDER, SET_NETWORK, SET_ACCOUNT, GOT_WALLET, DISMISS_CHECK].indexOf(
      action.type
    ) > -1
  ) {
    return initialState
  }

  if (action.type === WAIT_FOR_WALLET) {
    return { waiting: true }
  }

  return walletStatus
}

export default walletStatusReducer
