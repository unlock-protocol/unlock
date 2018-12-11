import {
  CREATE_LOCK,
  UPDATE_LOCK,
  ADD_LOCK,
  LOCK_DEPLOYED,
} from '../actions/lock'
import { setLockName } from '../actions/storage'
import StorageService from '../services/storageService'

export default function storageMiddleware({ dispatch }) {
  const storageService = new StorageService()

  return function(next) {
    return function(action) {
      switch (action.type) {
      case CREATE_LOCK:
        storageService.storeLockDetails(action.lock)
        break
      case UPDATE_LOCK:
        storageService.lockLookUp(action.address).then(results => {
          dispatch(setLockName(action.address, results.data.name))
        })
        break
      case ADD_LOCK:
        break
      case LOCK_DEPLOYED:
        storageService.updateLockDetails({
          currentAddress: action.lock.address,
          address: action.address,
        })
        storageService.lockLookUp(action.address).then(results => {
          dispatch(setLockName(action.address, results.data.name))
        })
      }

      next(action)
    }
  }
}
