import { ADD_TRANSACTION, UPDATE_TRANSACTION, DELETE_TRANSACTION } from '../actions/transaction'

export const initialState = {}

const transactionReducer = (transactions = initialState, action) => {

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
