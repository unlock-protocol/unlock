export const ADD_LOCK = 'ADD_LOCK'
export const CREATE_LOCK = 'CREATE_LOCK'
export const DELETE_LOCK = 'DELETE_LOCK'
export const LOCK_DEPLOYED = 'LOCK_DEPLOYED'
export const UPDATE_LOCK = 'UPDATE_LOCK'
export const UPDATE_LOCK_KEY_PRICE = 'UPDATE_LOCK_KEY_PRICE'
export const WITHDRAW_FROM_LOCK = 'WITHDRAW_FROM_LOCK'

export const createLock = lock => ({
  type: CREATE_LOCK,
  lock,
})

export const addLock = (address, lock) => ({
  type: ADD_LOCK,
  address,
  lock,
})

export const deleteLock = address => ({
  type: DELETE_LOCK,
  address,
})

export const updateLock = (address, update) => ({
  type: UPDATE_LOCK,
  address,
  update,
})

export const withdrawFromLock = lock => ({
  type: WITHDRAW_FROM_LOCK,
  lock,
})

export const lockDeployed = (lock, address) => ({
  type: LOCK_DEPLOYED,
  lock,
  address,
})

export const updateKeyPrice = (address, price) => ({
  type: UPDATE_LOCK_KEY_PRICE,
  address,
  price,
})
