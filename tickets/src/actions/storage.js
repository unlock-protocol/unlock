export const STORAGE_ERROR = 'storage/STORAGE_ERROR'
export const STORE_LOCK_NAME = 'storage/STORE_LOCK_NAME'

export function storageError(error) {
  return {
    type: STORAGE_ERROR,
    error,
  }
}

export function storeLockName(owner, lock, token) {
  return {
    type: STORE_LOCK_NAME,
    owner,
    lock,
    token,
  }
}
