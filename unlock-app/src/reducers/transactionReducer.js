import { SET_TRANSACTION } from '../actions/transaction'

const initialState = null

const transactionReducer = (state = initialState, action) => {

  if (action.type === SET_TRANSACTION) {
    return {
      ...action.transaction,
    }
  }

  return state
}

export default transactionReducer
