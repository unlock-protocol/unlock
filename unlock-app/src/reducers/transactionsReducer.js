import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  DELETE_TRANSACTION,
} from '../actions/transaction'

import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = {}

const transactionsReducer = (transactions = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  // Add the transaction
  if (action.type === ADD_TRANSACTION) {
    return {
      ...transactions,
      [action.transaction.hash]: action.transaction,
    }
  }

  // Replace the transaction with the updated value
  if (action.type === UPDATE_TRANSACTION) {
    if (action.update.hash && action.update.hash !== action.hash) {
      // 'Could not change the transaction hash' => Let's not change state
      return transactions
    }

    if (!transactions[action.hash]) {
      // 'Could not update missing transaction' => Let's not change state
      return transactions
    }

    return {
      ...transactions,
      [action.hash]: Object.assign(transactions[action.hash], action.update),
    }
  }

  if (action.type === DELETE_TRANSACTION) {
    const { [action.transaction.hash]: _, ...rest } = transactions
    return rest
  }

  return transactions
}

export default transactionsReducer
