export const ADD_LOCK = 'lock/ADD_LOCK'
export const UPDATE_LOCK = 'lock/UPDATE_LOCK'

export const addLock = (address, lock) => ({
  type: ADD_LOCK,
  address,
  lock,
})

export const updateLock = (address, update) => ({
  type: UPDATE_LOCK,
  address,
  update,
})
