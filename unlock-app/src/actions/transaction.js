export const ADD_TRANSACTION = 'transaction/ADD_TRANSACTION'
export const UPDATE_TRANSACTION = 'transaction/UPDATE_TRANSACTION'
export const DELETE_TRANSACTION = 'transaction/DELETE_TRANSACTION'
export const NEW_TRANSACTION = 'transaction/NEW_TRANSACTION'

export const newTransaction = (transaction) => ({
  type: NEW_TRANSACTION,
  transaction,
})

export const addTransaction = (transaction) => ({
  type: ADD_TRANSACTION,
  transaction,
})

export const updateTransaction = (hash, update) => ({
  type: UPDATE_TRANSACTION,
  hash,
  update,
})

export const deleteTransaction = (transaction) => ({
  type: DELETE_TRANSACTION,
  transaction,
})
