export const STORAGE_ERROR = 'storage/STORAGE_ERROR'
export const STORE_LOCK_CREATION = 'storage/STORE_LOCK_CREATION'

export function storageError(error) {
  return {
    type: STORAGE_ERROR,
    error: error,
  }
}

export function storeLockCreation(owner, lock, token) {
  return {
    type: STORE_LOCK_CREATION,
    owner: owner,
    lock: lock,
    token: token,
  }
}
