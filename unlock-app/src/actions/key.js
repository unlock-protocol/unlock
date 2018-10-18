export const PURCHASE_KEY = 'PURCHASE_KEY'
export const ADD_KEY = 'ADD_KEY'

export const purchaseKey = (lock, account) => ({
  type: PURCHASE_KEY,
  lock,
  account,
})

export const addKey = (key) => ({
  type: ADD_KEY,
  key,
})
