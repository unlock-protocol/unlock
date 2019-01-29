export const PURCHASE_KEY = 'PURCHASE_KEY'
export const ADD_KEY = 'ADD_KEY'
export const UPDATE_KEY = 'UPDATE_KEY'

export const purchaseKey = key => ({
  type: PURCHASE_KEY,
  key,
})

export const addKey = (id, key) => ({
  type: ADD_KEY,
  id,
  key,
})

export const updateKey = (id, update) => ({
  type: UPDATE_KEY,
  id,
  update,
})
