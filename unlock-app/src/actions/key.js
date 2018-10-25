export const PURCHASE_KEY = 'PURCHASE_KEY'
export const ADD_KEY = 'ADD_KEY'

export const purchaseKey = (key) => ({
  type: PURCHASE_KEY,
  key,
})

export const addKey = (key) => ({
  type: ADD_KEY,
  key,
})
