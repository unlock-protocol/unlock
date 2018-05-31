export const SET_TRANSACTION = 'SET_TRANSACTION'
export const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION'

export const setTransaction = transaction => ({
  type: SET_TRANSACTION,
  transaction,
})

export const updateTransaction = transaction => ({
  type: UPDATE_TRANSACTION,
  transaction,
})
