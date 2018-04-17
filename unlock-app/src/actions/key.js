
export const PURCHASE_KEY = 'PURCHASE_KEY'
export const SET_KEY = 'SET_KEY'

export const purchaseKey = (lock, account) => ({
  type: PURCHASE_KEY,
  lock,
  account,
})

export const setKey = (key) => ({
  type: SET_KEY,
  key,
})
