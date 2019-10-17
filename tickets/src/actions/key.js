export const PURCHASE_KEY = 'PURCHASE_KEY'
export const SET_KEY = 'SET_KEY'

export const purchaseKey = key => ({
  type: PURCHASE_KEY,
  key,
})

export const setKey = (id, key) => ({
  type: SET_KEY,
  id,
  key,
})
