export const SET_LOCK_NAME = 'storage/SET_LOCK_NAME'
export const STORAGE_ERROR = 'storage/STORAGE_ERROR'
export const STORE_LOCK_CREATION = 'storage/STORE_LOCK_CREATION'
export const STORE_LOCK_UPDATE = 'storage/STORE_LOCK_UPDATE'

export function setLockName(address, name) {
  return {
    type: SET_LOCK_NAME,
    address: address,
    name: name,
  }
}

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

export function storeLockUpdate(owner, currentLock, token, update) {
  return {
    type: STORE_LOCK_UPDATE,
    owner: owner,
    lockAddress: currentLock,
    token: token,
    update: update,
  }
}
