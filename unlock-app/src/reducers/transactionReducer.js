import { SET_TRANSACTION, UPDATE_TRANSACTION, DELETE_TRANSACTION } from '../actions/transaction'

const initialState = {
  latest: null,
  all: {},
  lastUpdated: 0,
}

const transactionReducer = (transactions = initialState, action) => {
  let newTransactions = Object.assign({}, transactions)

  if (action.type === SET_TRANSACTION) {
    if (action.transaction) {
      if (!newTransactions.latest || newTransactions.latest.createdAt >= action.transaction.createdAt)
        newTransactions.latest = Object.assign({}, action.transaction)
      if (action.transaction.hash) newTransactions.all[action.transaction.hash] = Object.assign({}, action.transaction)
    } else {
      newTransactions.latest = null // Unset the latest transaction if SET_TRANSACTION was called with no transaction
    }
  }

  // TODO: consider the use of createdAt vs hash?
  // Also it looks like we do not use latest anymore. If so, we should just have a "flat" object for transactions
  if (action.type === UPDATE_TRANSACTION && action.transaction) {
    if (action.transaction.createdAt === transactions.latest.createdAt) {
      if (!newTransactions.latest || newTransactions.latest.createdAt >= action.transaction.createdAt)
        newTransactions.latest = Object.assign({}, action.transaction)
      if (action.transaction.hash) newTransactions.all[action.transaction.hash] = Object.assign({}, action.transaction)
    }
  }

  if (action.type === DELETE_TRANSACTION && action.transaction) {
    delete newTransactions.all[action.transaction.hash]
    if (action.transaction.hash === transactions.latest.hash) {
      newTransactions.latest = null
    }
  }

  return newTransactions
}

export default transactionReducer
