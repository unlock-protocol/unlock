
export const CREATE_LOCK = 'CREATE_LOCK'
export const NEW_LOCK = 'NEW_LOCK'
export const SET_LOCK = 'SET_LOCK'
export const RESET_LOCK = 'RESET_LOCK'
export const PURCHASE_KEY = 'PURCHASE_KEY'
export const SET_KEY = 'SET_KEY'

export const createLock = (lock) => ({
  type: CREATE_LOCK,
  lock
})

export const newLock = (lockAddress) => ({
  type: NEW_LOCK,
  lockAddress
})

export const setLock = (lock) => ({
  type: SET_LOCK,
  lock
})

export const resetLock = (lock) => ({
  type: RESET_LOCK,
  lock
})

export const purchaseKey = (lock, account) => ({
  type: PURCHASE_KEY,
  lock,
  account
})

export const setKey = (key) => ({
  type: SET_KEY,
  key
})
