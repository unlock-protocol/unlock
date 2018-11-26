export const CREATE_LOCK = 'CREATE_LOCK'
export const SET_LOCK = 'SET_LOCK'
export const UPDATE_LOCK = 'UPDATE_LOCK'
export const WITHDRAW_FROM_LOCK = 'WITHDRAW_FROM_LOCK'
export const LOCK_DEPLOYED = 'LOCK_DEPLOYED'

export const createLock = lock => ({
  type: CREATE_LOCK,
  lock,
})

export const setLock = lock => ({
  type: SET_LOCK,
  lock,
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
