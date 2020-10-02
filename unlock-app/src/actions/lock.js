export const CREATE_LOCK = 'lock/CREATE_LOCK'
export const DELETE_LOCK = 'lock/DELETE_LOCK'
export const GET_LOCK = 'lock/GET_LOCK'
export const UPDATE_LOCK = 'lock/UPDATE_LOCK'
export const UPDATE_LOCK_KEY_PRICE = 'lock/UPDATE_LOCK_KEY_PRICE'
export const WITHDRAW_FROM_LOCK = 'lock/WITHDRAW_FROM_LOCK'

export const createLock = (lock) => ({
  type: CREATE_LOCK,
  lock,
})

export const deleteLock = (address) => ({
  type: DELETE_LOCK,
  address,
})

export const getLock = (address) => ({
  type: GET_LOCK,
  address,
})

export const updateLock = (address, update) => ({
  type: UPDATE_LOCK,
  address,
  update,
})

export const withdrawFromLock = (lock) => ({
  type: WITHDRAW_FROM_LOCK,
  lock,
})

// TODO: name should be updateLockKeyPrice
export const updateKeyPrice = (address, price) => ({
  type: UPDATE_LOCK_KEY_PRICE,
  address,
  price,
})
