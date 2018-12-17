import {
  CREATE_LOCK,
  UPDATE_LOCK,
  ADD_LOCK,
  LOCK_DEPLOYED,
} from '../actions/lock'
import { setLockName, storageError } from '../actions/storage'
import StorageService from '../services/storageService'

export default function storageMiddleware({ dispatch }) {
  const storageService = new StorageService()

  return function(next) {
    return function(action) {
      switch (action.type) {
      case CREATE_LOCK:
        storageService.storeLockDetails(action.lock).catch(error => {
          dispatch(storageError(error))
        })
        break
      case ADD_LOCK:
        break
      case UPDATE_LOCK:
        storageService
          .lockLookUp(action.address)
          .then(results => {
            dispatch(setLockName(action.address, results.data.name))
          })
          .catch(error => {
            dispatch(storageError(error))
          })
        break
      case LOCK_DEPLOYED:
        storageService
          .updateLockDetails({
            currentAddress: action.lock.address,
            address: action.address,
          })
          .catch(error => {
            dispatch(storageError(error))
          })
        storageService
          .lockLookUp(action.address)
          .then(results => {
            dispatch(setLockName(action.address, results.data.name))
          })
          .catch(error => {
            dispatch(storageError(error))
          })
      }
      next(action)
    }
  }
}
