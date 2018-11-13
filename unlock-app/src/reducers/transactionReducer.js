// TODO: for consistency rename into transactionsReducer since it keeps track of all transactions

import { ADD_TRANSACTION, UPDATE_TRANSACTION, DELETE_TRANSACTION } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = {}

const transactionReducer = (transactions = initialState, action) => {

  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type === ADD_TRANSACTION || action.type === UPDATE_TRANSACTION) {
    return {
      ...transactions,
      [action.transaction.hash]: action.transaction,
    }
  }

  if (action.type === DELETE_TRANSACTION) {
    const { [action.transaction.hash]: _, ...rest } = transactions
    return rest
  }

  return transactions
}

export default transactionReducer
