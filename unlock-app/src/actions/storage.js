export const SET_LOCK_NAME = 'SET_LOCK_NAME'
export const STORAGE_ERROR = 'STORAGE_ERROR'

export function setLockName(address, name) {
  return {
    type: 'SET_LOCK_NAME',
    address: address,
    name: name,
  }
}

export function storageError(error) {
  return {
    type: 'STORAGE_ERROR',
    error: error,
  }
}
