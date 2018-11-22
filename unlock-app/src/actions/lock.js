export const CREATE_LOCK = 'CREATE_LOCK'
export const SET_LOCK = 'SET_LOCK'
export const RESET_LOCK = 'RESET_LOCK'
export const WITHDRAW_FROM_LOCK = 'WITHDRAW_FROM_LOCK'

export const createLock = lock => ({
  type: CREATE_LOCK,
  lock,
})

export const setLock = lock => ({
  type: SET_LOCK,
  lock,
})

export const resetLock = (lock, update) => ({
  type: RESET_LOCK,
  lock,
  update,
})

export const withdrawFromLock = lock => ({
  type: WITHDRAW_FROM_LOCK,
  lock,
})
