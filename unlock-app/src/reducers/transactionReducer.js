import { SET_TRANSACTION } from '../actions/transaction'

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

  return state
}

export default transactionReducer
