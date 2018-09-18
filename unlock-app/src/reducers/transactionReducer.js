import { SET_TRANSACTION, UPDATE_TRANSACTION } from '../actions/transaction'

const initialState = {
  latest: null,
  all: {},
  lastUpdated: 0,
}

const transactionReducer = (transactions = initialState, action) => {
  let newTransactions = Object.assign({}, transactions)
  if (action.transaction) {
    if (action.type === SET_TRANSACTION ||
      (action.type === UPDATE_TRANSACTION && action.transaction.createdAt === transactions.latest.createdAt)) {
      newTransactions.latest = Object.assign({}, action.transaction)
      if (action.transaction.hash) newTransactions.all[action.transaction.hash] = Object.assign({}, action.transaction)
    }
  }
  return newTransactions
}

export default transactionReducer
