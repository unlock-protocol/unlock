import { SET_TRANSACTION, UPDATE_TRANSACTION } from '../actions/transaction'

const initialState = null

const transactionReducer = (state = initialState, action) => {

  if (action.type === SET_TRANSACTION) {
    if (action.transaction) {
      return {
        ...action.transaction,
      }
    }
    return null
  }

  if (action.type === UPDATE_TRANSACTION) {
    // Only change the transaction if it is the same as before
    if (action.transaction.createdAt === state.createdAt ) {
      return {
        ...action.transaction,
      }
    }
  }

  return state
}

export default transactionReducer
